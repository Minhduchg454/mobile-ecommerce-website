import React from "react"
import {
  Sidebar,
  Banner,
  BestSeller,
  DealDaily,
  FeatureProducts,
  CustomSlider,
  Blogs,
  Product,
} from "../../components"
import { useSelector } from "react-redux"
import icons from "../../ultils/icons"
import withBaseComponent from "hocs/withBaseComponent"
import { createSearchParams } from "react-router-dom"

const { IoIosArrowForward } = icons
const Home = ({ navigate }) => {
  const { newProducts } = useSelector((state) => state.products)
  const { categories } = useSelector((state) => state.app)

  return (
    <div className="w-full px-4">
      <div className="md:w-main m-auto flex flex-col md:flex-row mt-6">
        <div className="flex flex-col gap-5 md:w-[25%] flex-auto">
          <Sidebar />
          <DealDaily />
        </div>
        <div className="flex flex-col gap-5 md:pl-5 md:w-[75%] flex-auto">
          <Banner />
          <BestSeller />
        </div>
      </div>
      <div className="my-8 w-main m-auto">
        <FeatureProducts />
      </div>
      <div className="my-8 w-main m-auto">
        <h3 className="text-[20px] font-semibold py-[15px] border-b-2 border-main">
          SẢN PHẨM MỚI
        </h3>
        <div className="mt-4 hidden md:block mx-[-10px]">
          <CustomSlider products={newProducts} />
        </div>
        <div className="mt-4 w-screen pr-4 -ml-2 md:hidden">
          <div className="grid grid-cols-1 gap-4 w-full">
            {newProducts?.map((el, index) => (
              <div className="col-span-1" key={index}>
                <Product
                  pid={el._id}
                  productData={el}
                  isNew={true}
                  normal={true}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="my-8 w-main m-auto">
        <Blogs />
      </div>
    </div>
  )
}

export default withBaseComponent(Home)
