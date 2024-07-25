"use client";

import { ChatList } from "@/components/chat-list-openai-v2";
import Image from "next/image";
import { Button } from "@/components/ui/button"; // Import Button from shadcn
import RagExample from "@/components/rag-example";

function IconNewChat() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12.1464 1.14645C12.3417 0.951184 12.6583 0.951184 12.8535 1.14645L14.8535 3.14645C15.0488 3.34171 15.0488 3.65829 14.8535 3.85355L10.9109 7.79618C10.8349 7.87218 10.7471 7.93543 10.651 7.9835L6.72359 9.94721C6.53109 10.0435 6.29861 10.0057 6.14643 9.85355C5.99425 9.70137 5.95652 9.46889 6.05277 9.27639L8.01648 5.34897C8.06455 5.25283 8.1278 5.16507 8.2038 5.08907L12.1464 1.14645ZM12.5 2.20711L8.91091 5.79618L7.87266 7.87267L8.12731 8.12732L10.2038 7.08907L13.7929 3.5L12.5 2.20711ZM9.99998 2L8.99998 3H4.9C4.47171 3 4.18056 3.00039 3.95552 3.01877C3.73631 3.03668 3.62421 3.06915 3.54601 3.10899C3.35785 3.20487 3.20487 3.35785 3.10899 3.54601C3.06915 3.62421 3.03669 3.73631 3.01878 3.95552C3.00039 4.18056 3 4.47171 3 4.9V11.1C3 11.5283 3.00039 11.8194 3.01878 12.0445C3.03669 12.2637 3.06915 12.3758 3.10899 12.454C3.20487 12.6422 3.35785 12.7951 3.54601 12.891C3.62421 12.9309 3.73631 12.9633 3.95552 12.9812C4.18056 12.9996 4.47171 13 4.9 13H11.1C11.5283 13 11.8194 12.9996 12.0445 12.9812C12.2637 12.9633 12.3758 12.9309 12.454 12.891C12.6422 12.7951 12.7951 12.6422 12.891 12.454C12.9309 12.3758 12.9633 12.2637 12.9812 12.0445C12.9996 11.8194 13 11.5283 13 11.1V6.99998L14 5.99998V11.1V11.1207C14 11.5231 14 11.8553 13.9779 12.1259C13.9549 12.407 13.9057 12.6653 13.782 12.908C13.5903 13.2843 13.2843 13.5903 12.908 13.782C12.6653 13.9057 12.407 13.9549 12.1259 13.9779C11.8553 14 11.5231 14 11.1207 14H11.1H4.9H4.87934C4.47686 14 4.14468 14 3.87409 13.9779C3.59304 13.9549 3.33469 13.9057 3.09202 13.782C2.7157 13.5903 2.40973 13.2843 2.21799 12.908C2.09434 12.6653 2.04506 12.407 2.0221 12.1259C1.99999 11.8553 1.99999 11.5231 2 11.1207V11.1206V11.1V4.9V4.87935V4.87932V4.87931C1.99999 4.47685 1.99999 4.14468 2.0221 3.87409C2.04506 3.59304 2.09434 3.33469 2.21799 3.09202C2.40973 2.71569 2.7157 2.40973 3.09202 2.21799C3.33469 2.09434 3.59304 2.04506 3.87409 2.0221C4.14468 1.99999 4.47685 1.99999 4.87932 2H4.87935H4.9H9.99998Z"
        fill="currentColor"
        fill-rule="evenodd"
        clip-rule="evenodd"
      ></path>
    </svg>
  );
}

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function Header() {
  return (
    <div>
      <div className="absolute left-8 top-8">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                onClick={() => {
                  location.reload();
                }}
              >
                <IconNewChat />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>New chat</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="mb-16 relative z-[-1] flex flex-col items-center">
        <div className="relative flex flex-col items-center before:absolute before:h-[300px] before:w-full before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-full after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 sm:before:w-[480px] sm:after:w-[240px] before:lg:h-[360px] gap-4">
          <Image
            className="relative dark:drop-shadow-[0_0_0.3rem_#ffffff70] dark:invert"
            src="/screenpipe.svg"
            alt="Screenpipe Logo"
            width={180}
            height={37}
            priority
          />
          <p className="absolute left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
            Personalized AI powered by what you have seen, said, or heard.
          </p>
        </div>
      </div>
      <div className="mt-4 flex space-x-4 absolute top-4 right-4">
        {" "}
        {/* Added margin-top for spacing */}
        <Button
          asChild
          className="cursor-pointer"
          onClick={
            () =>
              window.open(
                "https://github.com/louis030195/screen-pipe/tree/main/examples/ts"
              )
            // open(
            //   "https://github.com/louis030195/screen-pipe/tree/main/examples/ts"
            // )
          }
        >
          <h2 className="mb-3 text-2xl font-semibold">Examples</h2>
        </Button>
        <Button
          asChild
          className="cursor-pointer"
          onClick={() =>
            window.open(
              "mailto:louis@screenpi.pe?subject=Screenpipe%20Feedback&body=Please%20enter%20your%20feedback%20here...%0A%0A...%20or%20let's%20chat?%0Ahttps://cal.com/louis030195/screenpipe"
            )
          }
        >
          <h2 className="mb-3 text-2xl font-semibold">Send feedback</h2>
        </Button>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react"; // Import useState
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

function Settings({
  onKeyChange,
  className,
}: {
  onKeyChange: (key: string) => void;
  className?: string;
}) {
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    const savedKey = localStorage.getItem("openaiApiKey");
    if (savedKey) {
      setApiKey(savedKey);
      onKeyChange(savedKey);
    }
  }, [onKeyChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newKey = e.target.value;
    setApiKey(newKey);
    localStorage.setItem("openaiApiKey", newKey);
    onKeyChange(newKey);
  };

  return (
    <Card className={cn("w-full max-w-md", className)}>
      <CardHeader>
        <CardTitle>OpenAI API Settings</CardTitle>
        <CardDescription>
          Enter your OpenAI API key to use the chat functionality.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid w-full items-center gap-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              // type="password"
              value={apiKey}
              onChange={handleChange}
              placeholder="Enter your OpenAI API Key"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an API key? Get one from{" "}
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              OpenAI&apos;s website
            </a>
            .
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
export default function Home() {
  const [openAiKey, setOpenAiKey] = useState("");

  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      <Header /> {/* Use Header component */}
      {/* TODO for some reason code block style broken when built */}
      {/* <RagExample /> */}
      <Settings onKeyChange={setOpenAiKey} className="absolute top-24 left-4" />
      <div className="h-32" />
      <ChatList apiKey={openAiKey} />
    </main>
  );
}
