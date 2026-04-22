"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { cn } from "@/lib/utils";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkOembed from "remark-oembed";
import rehypeRaw from "rehype-raw";
import { Copy, Globe2, Plus, PlusSquare, Send } from "lucide-react";
import { TypeAnimation } from "react-type-animation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import Dictaphone from "./speech-to-text";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { BACKEND_URL } from "@/config/config";
import { FileUploadDialog } from "./file-upload-dialog";
import { useImageUrlStore } from "@/store/image-url-store";
import { useUploaderOpen } from "@/store/uploader-open-store";

interface Message {
  sender: "user" | "bot";
  text: string;
  imageUrl?: string;
  isComplete?: boolean; // Only needed for bot
}

export const Chatbot = () => {
  const [messages, setMessages] = useState<Message[]>(() =>
    JSON.parse(localStorage.getItem("chatMessages") || "[]")
  );
  const [input, setInput] = useState("");
  const [chatId, setChatId] = useState(
    parseInt(localStorage.getItem("chatID") || "1")
  );
  const [isSearchON, setIsSearchON] = useState(false);
  const [loading, setLoading] = useState(false);

  const streamingBotMessage = useRef<Message | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isMobile = useIsMobile();
  const [isSpeaking, setIsSpeaking] = useState<number | null>(null); // Track which message is speaking
  const messageRefs = useRef<(HTMLDivElement | null)[]>([]);

  const synth = typeof window !== "undefined" ? window.speechSynthesis : null;

  const { t, i18n } = useTranslation();
  const { imageUrl, setImageUrl } = useImageUrlStore();
  const { set } = useUploaderOpen();

  useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(messages));
  }, [messages]);

  // Scroll to bottom when new message arrives
  useEffect(() => {
    const scrollContainer = document.querySelector(
      "[data-radix-scroll-area-viewport]"
    ) as HTMLDivElement;

    if (scrollContainer) {
      scrollContainer.scrollTo({
        top: scrollContainer.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const syncMessagesToStorage = (msgs: Message[]) => {
    localStorage.setItem("chatMessages", JSON.stringify(msgs));
  };

  const copyToClipboard = async (text: string) => {
    if (!navigator.clipboard) {
      console.error("Clipboard API not available in this browser");
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t("chat.copy_success"));
      console.log("Text copied to clipboard");
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const speakFromDiv = (index: number, lang: string = "en") => {
    if (lang === "pa") {
      toast.error("ਇਸ ਵੇਲੇ ਪੰਜਾਬੀ ਬੋਲਣ ਦਾ ਸਮਰਥਨ ਨਹੀਂ ਹੈ।");
      return;
    }

    const div = messageRefs.current[index];
    if (!div || !synth) return;

    const textToSpeak = div.innerText.trim(); // ✅ Extracts only plain text as seen on screen!

    if (isSpeaking === index) {
      synth.cancel(); // Stop speaking if already speaking this one
      setIsSpeaking(null);
    } else {
      synth.cancel(); // Stop any current speech
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = lang;
      utterance.rate = 1.0; // ✅ Set to natural speaking speed
      utterance.pitch = 1.0; // ✅ Standard pitch for clear pronunciation
      utterance.volume = 1.0;
      utterance.onend = () => setIsSpeaking(null);
      synth.speak(utterance);
      setIsSpeaking(index);
    }
  };

  const replaceYouTubeUrlsWithIframes = (text: string): string => {
    // Regular expression to find raw YouTube URLs
    const youtubeUrlPattern =
      /(?:https?:\/\/(?:www\.)?youtube\.com\/(?:[^"']*?[?&]v=|(?:v|e(?:mbed)?)\/))([^"&?\/\s]*)(?=\s|$)/g;
  
    // Replace only URLs that match the pattern with iframes
    return text.replace(youtubeUrlPattern, (match, videoId) => {
      // Check if it's already inside an iframe tag
      if (!match.includes("<iframe")) {
        // Ensure that the videoId is clean and no extra characters are added
        const cleanVideoId = videoId.replace(/[^\w\-]/g, ''); // Remove non-alphanumeric characters
        return `<iframe width="560" height="315" src="https://www.youtube.com/embed/${cleanVideoId}" frameborder="0" allowfullscreen></iframe>`;
      }
      return match;
    });
  };

  // const speakText = (text: string, index: number) => {
  //   if (!window.speechSynthesis) {
  //     alert("Speech Synthesis is not supported in this browser.");
  //     return;
  //   }

  //   // Stop any ongoing speech
  //   window.speechSynthesis.cancel();

  //   const utterance = new SpeechSynthesisUtterance(stripMarkdown(text));
  //   utterance.lang = "en-IN"; // You can dynamically set this if required

  //   utterance.onstart = () => setIsSpeaking(index);
  //   utterance.onend = () => setIsSpeaking(null);
  //   utterance.onerror = () => setIsSpeaking(null);

  //   window.speechSynthesis.speak(utterance);
  // };
  const sendMessage = async (input: string) => {
    if (!input.trim()) return; // Exit if input is empty or just spaces

    const userMessage: Message = imageUrl
      ? { sender: "user", text: input, imageUrl }
      : { sender: "user", text: input };

    setMessages((prev) => [...prev, userMessage]); // Add user's message to chat
    setInput(""); // Clear input box

    try {
      setLoading(true); // Set loading indicator for UI
      const resdetails =
        i18n.language === "hi"
          ? "हिंदी भाषा में उत्तर दें"
          : i18n.language === "pa"
          ? "ਪੰਜਾਬੀ ਭਾਸ਼ਾ ਵਿੱਚ ਉੱਤਰ ਦਿਓ"
          : " | reply in English";

      const ip = isSearchON
        ? input + resdetails + " | do internet search"
        : input + resdetails + " | don't do internet search";

      console.log("Here is the input: ", ip);

      // ✅ Initialize bot message with empty text
      const botMessage: Message = { sender: "bot", text: "" };
      setMessages((prev) => [...prev, botMessage]);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${BACKEND_URL}/ai/chat-stream/${chatId}`, true);
      xhr.setRequestHeader("Content-Type", "application/json");

      let accumulatedText = ""; // ✅ Stores full response properly

      // ✅ Improved handling for streaming
      xhr.onprogress = function () {
        const responseText = xhr.responseText;
        const newChunk = responseText.slice(accumulatedText.length); // ✅ Get new chunk
        accumulatedText += newChunk; // ✅ Append new chunk

        setMessages((prev) => {
          const updated = [...prev];
          const lastMsg = updated[updated.length - 1];
          if (lastMsg.sender === "bot") {
            updated[updated.length - 1] = {
              ...lastMsg,
              text: accumulatedText, // ✅ Update text with accumulated chunks
            };
          }
          return updated;
        });
      };

      // ✅ Handle end of stream
      xhr.onload = function () {
        setMessages((prev) => {
          const updated = [...prev];
          const lastMsg = updated[updated.length - 1];

          if (lastMsg.sender === "bot") {
            updated[updated.length - 1] = {
              ...lastMsg,
              text: accumulatedText,
              isComplete: true, // ✅ Mark as complete
            };
          }

          // ✅ Edge case: Handle search requirement
          if (
            updated[updated.length - 1].text.includes(
              "tavily_search_results_json"
            )
          ) {
            updated[updated.length - 1].text =
              "I need internet access to answer your query. Please enable the search feature.";
          }

          syncMessagesToStorage(updated);
          // setImageUrl(null);
          return updated;
        });

        setLoading(false);
      };

      xhr.onerror = function () {
        console.error("Streaming error:", xhr.statusText);
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: t("chat.error_fetching"), isComplete: true },
        ]);
        setLoading(false);
      };

      if (imageUrl) {
        xhr.send(JSON.stringify({ message: ip, images: [imageUrl] }));
      } else {
        xhr.send(JSON.stringify({ message: ip }));
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: t("chat.error_fetching"), isComplete: true },
      ]);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (imageUrl) {
      console.log("I am here");
      setImageUrl(null);
    }
  }, [messages]);
  useEffect(() => {
    console.log("I am here///");
    if (!loading && textareaRef.current) {
      textareaRef.current.focus(); // 3️⃣ Auto-focus when AI response completes
    }
  }, [loading]);

  return (
    <div className="h-full flex w-full flex-col justify-between">
      {/* <Button className="absolute top-2 left-2 z-10" onClick={toggleSidebar}>
        {open ? "Close" : "open"}
      </Button> */}
      {messages.length <= 0 && (
        <div className="h-full w-full flex flex-col justify-center items-center">
          <img
            src={
              "https://res.cloudinary.com/dabn2cnyh/image/upload/v1741755427/farmai-images/z6a2sxxvp0snggtly1yp.jpg"
            }
            width={60}
            height={60}
            alt="Farmer AI"
            className="mb-2"
          />
          <h2 className="text-2xl font-semibold text-center">
            {t("chat.welcome_title")}
          </h2>
          <p className="text-sm text-primary/70 text-center md:max-w-80 max-w-64">
            {t("chat.welcome_subtitle")}
          </p>
        </div>
      )}

      {messages?.length > 0 && (
        <ScrollArea className="flex-grow p-3 rounded-md">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={cn(
                "flex relative gap-2 items-start",
                msg.sender === "user" ? "" : "mb-8"
              )}
            >
              <img
                src={
                  msg.sender === "user"
                    ? "https://res.cloudinary.com/dabn2cnyh/image/upload/v1741755427/farmai-images/xs29xitcid308bkicjhf.png"
                    : "https://res.cloudinary.com/dabn2cnyh/image/upload/v1741755427/farmai-images/z6a2sxxvp0snggtly1yp.jpg"
                }
                width={25}
                height={25}
                alt={msg.sender}
                className={cn(
                  "rounded-full",
                  msg.sender === "user" && "hidden"
                )}
              />
              {msg.text?.length < 1 && (
                <Skeleton className="w-[18rem] h-14 bg-gray-300 rounded-md px-3 py-2 relative">
                  <TypeAnimation
                    sequence={[
                      t("chat.thinking_1"),
                      3000,
                      t("chat.thinking_2"),
                      4000,
                      t("chat.thinking_3"),
                      3000,
                      t("chat.thinking_4"),
                      4000,
                    ]}
                    wrapper="span"
                    speed={50}
                    style={{ display: "inline-block" }}
                    repeat={Infinity}
                  />
                </Skeleton>
              )}
              <div
                key={index}
                ref={(el) => {
                  messageRefs.current[index] = el;
                }}
                className={` text-start mb-2 p-2 rounded-md max-w-[25rem] md:max-w-[25rem] lg:max-w-[40rem] ${
                  msg.sender === "user"
                    ? "bg-secondary text-primary ml-auto overflow-x-clip max-w-[19rem] md:max-w-[25rem] lg:max-w-[40rem]"
                    : "text-primary mr-auto overflow-x-auto max-w-[25rem] md:max-w-[25rem] lg:max-w-[40rem]"
                }`}
              >
                {msg.imageUrl && (
                  <img
                    src={msg.imageUrl || ""}
                    alt="User uploaded"
                    className="w-full h-40 object-cover rounded-md mb-2"
                  />
                )}
                <Markdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                >
                  {replaceYouTubeUrlsWithIframes(msg.text)}
                </Markdown>

                {/* Speak button only for bot messages */}
                {msg.sender === "bot" && msg.isComplete && (
                  <div className="flex gap-2 mt-1 rounded-full text-xs md:text-sm bg-secondary max-w-fit overflow-hidden">
                    <Button
                      variant={"secondary"}
                      className=""
                      size={"sm"}
                      onClick={() => copyToClipboard(msg.text)}
                    >
                      <Copy className="size-2" />
                    </Button>
                    <Button
                      onClick={() => speakFromDiv(index, i18n.language)}
                      size={"sm"}
                      variant={"ghost"}
                      className={` left-10 -bottom-3 p-1 pr-3 rounded-full  ${
                        isSpeaking === index ? "" : ""
                      }`}
                      aria-label={
                        isSpeaking === index
                          ? t("chat.stop_speaking")
                          : t("chat.speak_message")
                      }
                    >
                      {isSpeaking === index ? "🔇" : "🔊"}
                    </Button>
                  </div>
                )}
              </div>
              <img
                src={
                  msg.sender === "user"
                    ? "https://res.cloudinary.com/dabn2cnyh/image/upload/v1741755427/farmai-images/xs29xitcid308bkicjhf.png"
                    : "https://res.cloudinary.com/dabn2cnyh/image/upload/v1741755427/farmai-images/z6a2sxxvp0snggtly1yp.jpg"
                }
                width={25}
                height={25}
                alt={msg.sender}
                className={cn("rounded-full", msg.sender === "bot" && "hidden")}
              />
            </div>
          ))}
        </ScrollArea>
      )}

      <TooltipProvider>
        <div className="flex px-3 py-4 w-full gap-2 bg-secondary shadow-sm flex-col border rounded-xl max-w-[calc(100%-10%)] mb-2 mx-auto">
          <Textarea
            style={{
              resize: "none",
              overflow: "hidden",
              height: "auto",
              minHeight: "20px",
              maxHeight: "200px",
            }}
            ref={textareaRef}
            className="flex flex-grow"
            placeholder={t("chat.placeholder")}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
            disabled={loading}
          />
          <div className="flex flex-row-reverse justify-between">
            <div className=" flex gap-2 justify-end overflow-hidden">
              {input.length > 0 ? (
                <Button onClick={() => sendMessage(input)} disabled={loading}>
                  <Send size={24} className="" />
                </Button>
              ) : (
                <Dictaphone
                  setInput={setInput}
                  sendMessage={sendMessage}
                  disabled={loading}
                />
              )}
            </div>
            <div className="flex gap-2 items-center">
              {imageUrl && (
                <img
                  src={imageUrl || ""}
                  alt="User uploaded"
                  className="size-8 rounded-md"
                />
              )}
              <FileUploadDialog />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={"outline"}
                    className=" rounded-md"
                    onClick={() => set(true)}
                  >
                    <Plus size={24} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t("Upload Image")}</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={isSearchON ? "default" : "outline"}
                    onClick={() => setIsSearchON((prev) => !prev)}
                  >
                    <Globe2 size={24} />
                    {!isMobile && t("chat.search_toggle")}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t("chat.search_tooltip")}</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={"outline"}
                    onClick={() => {
                      localStorage.setItem("chatMessages", "[]");
                      setChatId((prev) => {
                        const newChatId = prev + 1;
                        localStorage.setItem("chatID", `${newChatId}`);
                        return newChatId;
                      });
                      setMessages([]);
                    }}
                  >
                    <PlusSquare size={24} />
                    {!isMobile && t("chat.clear_chat")}
                  </Button>
                </TooltipTrigger>

                <TooltipContent>{t("chat.clear_chat_tooltip")}</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
};
