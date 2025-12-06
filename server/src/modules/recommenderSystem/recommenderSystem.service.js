const Order = require("../order/entities/order.model");
const Preview = require("../preview/entities/preview.model");
const OrderStatus = require("../order/entities/order-status.model");
const ProductService = require("../product/product.service");
const redis = require("../../config/redis");

async function ensureOrderStatusByName(name) {
  const allowed = [
    "Pending",
    "Confirmed",
    "Shipping",
    "Succeeded",
    "Cancelled",
    "Delivered",
  ];
  if (!allowed.includes(name))
    throw new Error(`orderStatus không hợp lệ: ${name}`);

  const doc = await OrderStatus.findOneAndUpdate(
    { orderStatusName: name },
    { $setOnInsert: { orderStatusName: name } },
    { new: true, upsert: true }
  ).lean();
  return doc._id;
}

class RecommendationService {
  static async buildUserItemMatrix() {
    console.log("[Item Matrix] Bắt đầu xây ma trận gợi ý...");
    const startTime = Date.now();
    const succeededId = await ensureOrderStatusByName("Succeeded");
    const deliveredId = await ensureOrderStatusByName("Delivered");

    // 1. Lấy tất cả tương tác mua hàng (Order) và chiếu ra Product ID
    const successfulInteractions = await Order.aggregate([
      {
        $match: {
          orderStatusId: {
            $in: [succeededId, deliveredId],
          },
        },
      },
      {
        $lookup: {
          from: "orderdetails",
          localField: "_id", //bang tham chieu
          foreignField: "orderId", //bang hien tai
          as: "orderDetails",
        },
        //Lay tat ca orderdetails co _id cua no khop voi orderId cua order
      },
      { $unwind: "$orderDetails" },
      {
        $lookup: {
          from: "productvariations",
          localField: "orderDetails.pvId",
          foreignField: "_id",
          as: "pv",
        },
      },
      { $unwind: "$pv" },
      {
        $project: {
          userId: "$customerId",
          itemId: "$pv.productId",
          _id: 0,
        },
      },
    ]);

    // 2. Lấy tất cả đánh giá (Preview) và ánh xạ sang Product ID
    const reviewsWithProductId = await Preview.aggregate([
      {
        $match: { isDeleted: false },
      },
      {
        $lookup: {
          from: "productvariations",
          localField: "pvId",
          foreignField: "_id",
          as: "pv",
        },
      },
      { $unwind: "$pv" },
      {
        $project: {
          userId: "$customerId",
          previewRate: 1,
          itemId: "$pv.productId",
        },
      },
    ]);

    // 3. Xây map để lưu trữ tạm thời Tổng điểm và Số lần đánh giá
    //    Cấu trúc: Map<userId, Map<itemId, { score: Number, count: Number }>>
    const interactionsData = new Map();

    // 3.1. Từ đơn hàng: mua = 3 điểm (Mặc định)
    for (const interaction of successfulInteractions) {
      const userId = interaction.userId.toString();
      const itemId = interaction.itemId.toString();

      if (!interactionsData.has(userId))
        interactionsData.set(userId, new Map());
      const userItemMap = interactionsData.get(userId);

      // Nếu chưa có tương tác hoặc điểm thấp hơn 3 (tránh ghi đè rating > 3)
      const currentData = userItemMap.get(itemId) || { score: 0, count: 0 };

      // Chỉ gán điểm 3 nếu chưa có tương tác hoặc tương tác trước đó không phải rating (count=0)
      if (currentData.count === 0 && currentData.score < 3) {
        userItemMap.set(itemId, { score: 3, count: 1, isPurchase: true });
      }
      // Lưu ý: Nhiều lần mua hàng (interaction) cho cùng một Product ID sẽ không làm thay đổi điểm 3 này.
    }

    // 3.2. Từ đánh giá: cộng dồn tổng điểm và số lần đánh giá
    for (const review of reviewsWithProductId) {
      const userId = review.userId.toString();
      const itemId = review.itemId.toString();
      const rating = review.previewRate;

      if (!interactionsData.has(userId))
        interactionsData.set(userId, new Map());
      const userItemMap = interactionsData.get(userId);

      // Khởi tạo hoặc lấy dữ liệu hiện có
      const currentData = userItemMap.get(itemId) || { score: 0, count: 0 };

      if (currentData.isPurchase) {
        // Nếu đã có điểm mua hàng (3 điểm), chúng ta reset score và count để bắt đầu tính trung bình rating
        currentData.score = rating;
        currentData.count = 1; // Đây là đánh giá đầu tiên
        currentData.isPurchase = false; // Đánh dấu là đã chuyển sang rating
      } else {
        // Nếu đã có rating (hoặc là lần đánh giá thứ hai trở đi)
        currentData.score += rating; // Cộng dồn điểm rating
        currentData.count += 1; // Tăng số lần đánh giá
      }

      userItemMap.set(itemId, currentData);
    }

    // 3.3. CHUẨN HÓA: Chuyển dữ liệu tạm thời sang Ma trận điểm cuối cùng (làm tròn len)
    const finalInteractions = new Map();

    for (const [userId, itemMap] of interactionsData.entries()) {
      const finalItemMap = new Map();
      for (const [itemId, data] of itemMap.entries()) {
        let finalScore;

        if (data.isPurchase || (data.count === 1 && data.score === 3)) {
          // Trường hợp chỉ mua hàng (hoặc 1 lần mua duy nhất)
          finalScore = 3;
        } else if (data.count > 0) {
          // Trường hợp có rating (có thể là 1 hoặc nhiều lần)
          // Tính điểm trung bình của rating và làm tròn
          finalScore = Math.round(data.score / data.count);
          // Đảm bảo score luôn nằm trong 1-5
          finalScore = Math.min(5, Math.max(1, finalScore));
        } else {
          continue;
        }

        finalItemMap.set(itemId, finalScore);
      }
      finalInteractions.set(userId, finalItemMap);
    }

    // 4. Chuyển sang ma trận (dạng sparse) - SỬ DỤNG finalInteractions
    const users = [];
    const userIndexMap = {};
    const itemIds = new Set();
    let userIdx = 0;

    for (const [userId, itemMap] of finalInteractions) {
      users.push(userId);
      userIndexMap[userId] = userIdx++;
      for (const itemId of itemMap.keys()) {
        itemIds.add(itemId);
      }
    }

    const itemIdList = Array.from(itemIds);
    const itemIndexMap = {};
    itemIdList.forEach((id, i) => (itemIndexMap[id] = i));

    // Ma trận dạng sparse
    const sparseMatrix = users.map(() => ({}));

    for (let i = 0; i < users.length; i++) {
      const userId = users[i];
      const itemMap = finalInteractions.get(userId);
      for (const [itemId, score] of itemMap) {
        sparseMatrix[i][itemIndexMap[itemId]] = score;
      }
    }

    const result = {
      sparseMatrix,
      users,
      userIndexMap,
      itemIds: itemIdList,
      itemIndexMap,
      builtAt: new Date(),
      totalUsers: users.length,
      totalItems: itemIdList.length,
    };

    // 5. Lưu vào Redis
    await redis.set(
      "cf_matrix_sparse",
      JSON.stringify(result),
      "EX",
      60 * 60 * 24
    );

    console.log(
      `[Item Matrix] Xây ma trận thành công! ${result.totalUsers} users, ${
        result.totalItems
      } sản phẩm. Thời gian: ${Date.now() - startTime}ms`
    );
    return result;
  }

  /**
   * Lấy gợi ý cho 1 user
   * Trả về danh sách Product ID.
   */
  static async getRecommendations(userId, limit = 20) {
    console.log(`\n========== BẮT ĐẦU GỢI Ý CHO USER: ${userId} ==========`);

    const cache = await redis.get("cf_matrix_sparse");
    if (!cache) return [];

    const { sparseMatrix, users, userIndexMap, itemIds, itemIndexMap } =
      JSON.parse(cache);

    const userIdx = userIndexMap[userId];
    if (userIdx === undefined) {
      console.log("User chưa có lịch sử tương tác.");
      return [];
    }

    // 1. In ra Vector của user hiện tại (để báo cáo biết user này thích gì)
    const currentUserVector = sparseMatrix[userIdx];
    console.log(
      "1. Lịch sử tương tác của User mục tiêu lấy từ ma trận người dùng - sản phẩm:",
      JSON.stringify(currentUserVector)
    );

    const similarities = new Array(users.length).fill(0);
    const neighborLogs = []; // Lưu lại để in báo cáo

    // --- GIAI ĐOẠN 1: TÍNH ĐỘ TƯƠNG ĐỒNG (COSINE SIMILARITY) ---
    for (let i = 0; i < users.length; i++) {
      if (i === userIdx) continue;
      const vecA = sparseMatrix[userIdx];
      const vecB = sparseMatrix[i];

      let dot = 0,
        normA = 0,
        normB = 0;

      // Tối ưu vòng lặp: Chỉ duyệt các item User A có
      for (const [idx, scoreA] of Object.entries(vecA)) {
        const scoreB = vecB[idx] || 0;
        if (scoreB > 0) dot += scoreA * scoreB; // Sản phẩm chung
        normA += scoreA * scoreA;
      }
      for (const score of Object.values(vecB)) {
        normB += score * score;
      }

      normA = Math.sqrt(normA);
      normB = Math.sqrt(normB);

      const sim = normA && normB ? dot / (normA * normB) : 0;
      similarities[i] = sim;

      // Chỉ log những người có độ tương đồng > 0 để báo cáo đỡ rác
      if (sim > 0.1) {
        neighborLogs.push({
          "Mã người dùng": users[i], // Tên/ID người hàng xóm
          "Độ tương đồng": sim.toFixed(4), // Làm tròn 4 số
          "Tích vô hướng": dot, // Điểm tích vô hướng (thể hiện mức độ trùng lặp)
        });
      }
    }

    // Sắp xếp neighbor giảm dần để in ra Top 5 người giống nhất
    neighborLogs.sort((a, b) => b.Similarity - a.Similarity);
    console.log("\n2.Tính toán độ tương đồng: ");
    console.table(neighborLogs.slice(0, 5)); // Dùng console.table cực đẹp cho báo cáo

    // --- GIAI ĐOẠN 2: DỰ ĐOÁN ĐIỂM (PREDICTION) ---
    const scores = {};
    const predictionLogs = []; // Log chi tiết công thức tính

    for (let itemIdx = 0; itemIdx < itemIds.length; itemIdx++) {
      // Bỏ qua item đã mua
      if (sparseMatrix[userIdx].hasOwnProperty(itemIdx)) continue;
      let totalScore = 0;
      let totalWeight = 0;
      let contributors = []; // Ai đóng góp vào điểm số này?

      for (let i = 0; i < users.length; i++) {
        const sim = similarities[i];
        if (sim < 0.1) continue;

        const rating = sparseMatrix[i][itemIdx] ?? 0;
        if (rating > 0) {
          totalScore += sim * rating;
          totalWeight += sim;

          // Lưu lại vết: Người này đóng góp bao nhiêu
          if (contributors.length < 3) {
            // Chỉ lấy 3 người đại diện để log
            contributors.push(
              `(User ${users[i]} [Sim:${sim.toFixed(2)}] * Rate:${rating})`
            );
          }
        }
      }

      if (totalWeight > 0) {
        const finalScore = totalScore / totalWeight;
        const itemId = itemIds[itemIdx];
        scores[itemId] = finalScore;

        // Log chi tiết công thức cho 3 sản phẩm đầu tiên tìm được
        if (predictionLogs.length < 3) {
          predictionLogs.push({
            "Mã sản phẩm": itemId,
            "Dự đoán điểm số": finalScore.toFixed(4),
          });
        }
      }
    }

    console.log("\n3. Dự đoán điểm số:");
    console.table(predictionLogs);

    // --- GIAI ĐOẠN 3: SẮP XẾP VÀ TRẢ VỀ ---
    const result = Object.keys(scores)
      .sort((a, b) => scores[b] - scores[a])
      .slice(0, limit);

    console.log(`\n4. Kết quả cuối cùng:`, result);
    console.log("======================================================\n");

    return result;
  }

  /**
   * Lấy danh sách Product chi tiết từ Product ID được gợi ý.
   */
  static async getRecommendedProducts(userId, limit = 20) {
    // Hàm này giờ trả về danh sách Product ID
    const recommendedProductIds = await this.getRecommendations(userId, limit);

    if (!recommendedProductIds || recommendedProductIds.length === 0) {
      return {
        success: true,
        message: "Không tìm thấy gợi ý nào cho người dùng này.",
        total: 0,
        products: [],
        pageInfo: { hasMore: false, nextCursor: null },
      };
    }

    // Chuẩn bị query để gọi ProductService.getProducts
    const productQuery = {
      productIds: recommendedProductIds,
      limit: recommendedProductIds.length,
      viewer: "public",
    };

    // Gọi hàm Service Product để lấy thông tin sản phẩm đầy đủ
    const result = await ProductService.getProducts(productQuery);
    return result;
  }
}

module.exports = RecommendationService;
