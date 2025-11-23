import { useState } from "react";
import { XMarkIcon, ChatBubbleOvalLeftIcon } from "@heroicons/react/24/solid";
import { APP_INFO } from "../../ultils/contants";
import { Chat } from "./chat";
import { openChatBox, closeChatBox } from "../../store/chat/chatSlice";
import { useDispatch, useSelector } from "react-redux";

export const ChatGlobal = () => {
  const dispatch = useDispatch();
  const { isChatOpen, targetConversationId, totalUnreadChat } = useSelector(
    (state) => state.chat
  );
  const [showIntro, setShowIntro] = useState(true);
  const handleOpen = () => {
    dispatch(openChatBox(null));
  };

  const handleClose = () => {
    dispatch(closeChatBox());
  };

  return (
    <div>
      {/* Intro Box & Open Button */}
      <div className="group fixed bottom-5 right-10 flex flex-col items-end gap-2">
        {!isChatOpen && showIntro && (
          <div className="glass relative border border-gray-300 shadow-md px-3 py-2 rounded-3xl text-sm text-gray-800 max-w-[500px]">
            <button
              onClick={() => setShowIntro(false)}
              className="absolute w-6 h-6 p-1 flex justify-center items-center border bg-gray-400 rounded-full -top-7 right-0 text-white hover:text-black hover:bg-white opacity-0 group-hover:opacity-100"
            >
              <XMarkIcon />
            </button>
            <div>
              <p>Xin chào anh/chị</p>
              <p>
                Em là{" "}
                <span className="font-semibold text-blue-600">trợ lý AI</span>{" "}
                của{" "}
                <span className="font-semibold text-blue-600">
                  {APP_INFO.NAME}
                </span>
              </p>
            </div>
          </div>
        )}

        {!isChatOpen && (
          <button
            onClick={handleOpen}
            className="relative glass hover:bg-gray-200 border-gray-300 hover:shadow-xl text-blue-700 p-2 rounded-full shadow-xl focus:outline-none transition duration-200 border"
          >
            <ChatBubbleOvalLeftIcon className="w-7 h-7 md:w-10 md:h-10" />
            {totalUnreadChat > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                {totalUnreadChat > 99 ? "99+" : totalUnreadChat}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Chat Window */}
      {isChatOpen && (
        <div className="fixed bottom-0 right-0 md:bottom-5 md:right-10 z-[90]">
          {/* Truyền targetId vào component Chat thông qua props */}
          <Chat
            customClose={handleClose}
            conversationIdFromProps={targetConversationId}
          />
        </div>
      )}
    </div>
  );
};
