"use client";

import "regenerator-runtime/runtime";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic } from "lucide-react";
import { translateTo } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface DictaphoneProps {
  setInput: Dispatch<SetStateAction<string>>;
  sendMessage: (input: string) => Promise<void>;
  disabled: boolean;
}

const Dictaphone = ({ setInput, sendMessage, disabled }: DictaphoneProps) => {
  const { transcript, resetTranscript, browserSupportsSpeechRecognition } =
    useSpeechRecognition();
  const [isListening, setIsListening] = useState(false);
  const [finalTranscript, setFinalTranscript] = useState("");
  const {i18n} = useTranslation();

  // Function to start listening
  const startListening = () => {
    setIsListening(true);
    resetTranscript(); // Clear previous transcript
    setFinalTranscript(""); // Clear stored final transcript
    SpeechRecognition.startListening({
      continuous: true, // Keeps listening for longer
      interimResults: true, // Captures words as they are spoken
      language: "en-IN", // Use locale-specific recognition
    });
  };

  // Function to stop listening and process final transcript
  const stopListening = () => {
    setIsListening(false);
    SpeechRecognition.stopListening();

    // Wait a moment to ensure full transcription before storing
    setTimeout(() => {
      setFinalTranscript(transcript.trim()); // Store the final transcript
      setInput(transcript.trim());
      translateTo(transcript.trim(), "en", i18n.language)
        .then((translated) => {
          sendMessage(translated);
        })
        .catch((err) => {
          console.log(err);
          sendMessage(transcript.trim());
        });
    }, 1000); // Small delay for better accuracy
  };

  // Ensure transcript is captured correctly (especially on mobile)
  useEffect(() => {
    if (!isListening && transcript) {
      setFinalTranscript(transcript.trim());
    }
  }, [transcript, isListening]);

  if (!browserSupportsSpeechRecognition) {
    return (
      <Button disabled>
        <Mic size={24} />
      </Button>
    );
  }

  return (
    <div className="flex gap-2 items-center">
      {isListening && (
        <div className="size-6 bg-red-700 rounded-full animate-pulse" />
      )}

      <Button
        onMouseDown={startListening}
        onMouseUp={stopListening}
        onTouchStart={startListening} // For mobile
        onTouchEnd={stopListening} // For mobile
        disabled={disabled}
      >
        <Mic size={24} />
      </Button>
    </div>
  );
};

export default Dictaphone;
