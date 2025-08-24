import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  ArrowRight,
  CheckCircle,
  MessageCircle,
  X,
  File,
  Sun,
  Moon,
  Sparkles,
  Zap,
  Globe,
  CreditCard,
  Shield,
  Rocket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useAgent } from "@/hooks/use-agent";
import { useAccount } from "wagmi";
import { toast } from "sonner";
import { createAppKit } from "@reown/appkit";
import { wagmiAdapter, metadata } from "@/wallet-config";
import { seiTestnet } from "@reown/appkit/networks";

const suggestedMessages = [
  "I want to create a payment link",
  "How do I set up content gating?",
  "Show me how to process payroll payments",
];

const features = [
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Instant Setup",
    description: "Get started in seconds with our intuitive interface",
  },
  {
    icon: <Globe className="w-6 h-6" />,
    title: "Multi-currency",
    description: "Accept payments in any cryptocurrency on Sei Network",
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Secure",
    description: "Built with enterprise-grade security standards",
  },
];

const Home = () => {
  const { address } = useAccount();

  const [input, setInput] = useState("");
  const [payload, setPayload] = useState({});
  const [showConversation, setShowConversation] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, isThinking, preview } = useAgent();

  const modal = createAppKit({
    adapters: [wagmiAdapter],
    projectId: import.meta.env.VITE_REOWN_PROJECT_ID!,
    networks: [seiTestnet],
    defaultNetwork: seiTestnet,
    metadata: metadata,
    features: {
      analytics: true,
    },
  });

  useEffect(() => {
    setPayload({
      address,
      message: `This is the wallet address of the connected user ${address}`,
    });
  }, [address]);

  const sharePreview = async () => {
    try {
      await navigator.share({ url: preview });
    } catch (error) {
      console.log(error);
      toast("Failed to copy.");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        textareaRef.current &&
        !textareaRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);

    if (!address) {
      return toast("Connect your wallet..");
    }

    if (input?.trim()) {
      if (isThinking) return;

      setShowConversation(true);

      await sendMessage({
        threadId: address,
        input,
        payload: JSON.stringify(payload),
        file: selectedFile,
      });

      setInput("");
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    setShowSuggestions(false);
    textareaRef.current?.focus();
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(undefined);
    if (fileRef.current) {
      fileRef.current.value = "";
    }
  };

  return (
    <div
      className={`min-h-screen font-space-grotesk ${isDarkMode ? "dark" : ""}`}
    >
      {/* Background with animated orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-primary rounded-full opacity-20 blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-accent rounded-full opacity-15 blur-3xl"
          animate={{
            x: [0, -30, 0],
            y: [0, 40, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-hero rounded-full opacity-10 blur-3xl"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      {/* Conversation Sidebar */}
      <AnimatePresence>
        {showConversation && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-card/95 backdrop-blur-xl border-l border-border z-50 flex flex-col shadow-2xl"
          >
            <div className="flex items-center justify-between h-20 px-4 border-b border-border">
              <div className="flex items-center gap-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center"
                >
                  <MessageCircle className="w-4 h-4 text-white" />
                </motion.div>
                <span className="text-lg font-semibold text-foreground">
                  SeiMoney AI
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowConversation(false)}
                className="hover:bg-secondary/80"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs px-4 py-3 rounded-2xl ${
                      message.sender === "user"
                        ? "bg-gradient-primary text-white"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    <p
                      className="text-sm rich-text"
                      dangerouslySetInnerHTML={{ __html: message.text }}
                    ></p>
                  </div>
                </motion.div>
              ))}
              {isThinking && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-secondary text-secondary-foreground px-4 py-3 rounded-2xl">
                    <div className="flex space-x-1">
                      <motion.span
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: 0,
                        }}
                        className="w-2 h-2 bg-current rounded-full"
                      />
                      <motion.span
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: 0.2,
                        }}
                        className="w-2 h-2 bg-current rounded-full"
                      />
                      <motion.span
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: 0.4,
                        }}
                        className="w-2 h-2 bg-current rounded-full"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-6 border-t border-border">
              {/* File upload indicator */}
              {selectedFile && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg mb-3"
                >
                  <File className="w-4 h-4 text-primary" />
                  <span className="text-sm text-secondary-foreground flex-1 truncate">
                    {selectedFile.name}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeFile}
                    className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </motion.div>
              )}

              <form onSubmit={handleChatSubmit} className="flex gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Continue the conversation..."
                  className="flex-1 resize-none bg-background/50 min-h-[44px] max-h-32"
                  disabled={isThinking}
                />

                <div className="flex items-center justify-between">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => fileRef.current?.click()}
                    disabled={isThinking}
                    className="text-muted-foreground"
                  >
                    <File className="w-4 h-4" />
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!input.trim() || isThinking}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl"
      >
        <div className="container mx-auto">
          <nav className="flex items-center h-20 justify-between">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                SeiMoney
              </span>
            </motion.div>

            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                className="text-muted-foreground hover:text-foreground"
              >
                Docs
              </Button>
              <Button
                onClick={() => {
                  modal.open();
                }}
                className="bg-gradient-primary hover:opacity-90 text-white"
              >
                {address
                  ? `${address.substring(0, 4)}...${address.substring(
                      address.length - 4,
                      address.length
                    )}`
                  : "Connect Wallet"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="w-10 h-10 rounded-full"
              >
                {isDarkMode ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </Button>
            </div>
          </nav>
        </div>
      </motion.header>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileRef}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Gradient Arc Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[800px] h-[600px] bg-gradient-arc rounded-full blur-3xl opacity-30" />
      </div>

      {!showConversation ? (
        <>
          {/* Main Content */}
          <main className="relative z-10">
            <div className="container mx-auto px-6 py-20">
              {/* Hero Section */}
              <motion.section
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center max-w-4xl mx-auto mb-20"
              >
                <motion.h1
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
                >
                  Simplifying{" "}
                  <span className="bg-gradient-hero bg-clip-text text-transparent">
                    Internet Money
                  </span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto"
                >
                  The most powerful Web3 payment infrastructure built on Sei and
                  x402. Create payment links, stores, and payroll systems in
                  seconds.
                </motion.p>

                {/* AI Chat Box */}
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="relative max-w-2xl mx-auto mb-12"
                >
                  {/* Reflection effect */}
                  <div className="absolute inset-0 bg-gradient-arc rounded-xl opacity-20 blur-xl transform scale-110" />
                  <Card className="relative p-6 bg-card/50 backdrop-blur-sm border-border/50 shadow-glow">
                    <form onSubmit={handleChatSubmit} className="space-y-4">
                      <div className="relative">
                        <Textarea
                          ref={textareaRef}
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onFocus={() => setShowSuggestions(true)}
                          placeholder="Type your payment request..."
                          className="resize-none bg-background/50 min-h-[120px] text-base"
                          disabled={isThinking}
                        />

                        {/* Suggestions Dropdown */}
                        <AnimatePresence>
                          {showSuggestions && input === "" && (
                            <motion.div
                              ref={dropdownRef}
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl z-50"
                            >
                              <div className="p-3 border-b border-border">
                                <span className="text-sm font-medium text-muted-foreground">
                                  Suggested messages
                                </span>
                              </div>
                              <div className="p-2">
                                {suggestedMessages.map((message, index) => (
                                  <motion.button
                                    key={index}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    type="button"
                                    className="w-full text-left p-3 rounded-lg hover:bg-secondary transition-colors text-sm"
                                    onClick={() =>
                                      handleSuggestionClick(message)
                                    }
                                  >
                                    {message}
                                  </motion.button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* File upload indicator */}
                      {selectedFile && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg mb-3"
                        >
                          <File className="w-4 h-4 text-primary" />
                          <span className="text-sm text-secondary-foreground flex-1 truncate">
                            {selectedFile.name}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={removeFile}
                            className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </motion.div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => fileRef.current?.click()}
                            disabled={isThinking}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <File className="w-4 h-4" />
                          </Button>
                        </div>

                        <Button
                          type="submit"
                          disabled={!input?.trim() || isThinking}
                          className="bg-gradient-primary hover:opacity-90 text-white shadow-primary"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Send
                        </Button>
                      </div>
                    </form>

                    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border/50">
                      {features.map((feature, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.8 + index * 0.1 }}
                          className="flex items-center gap-2 px-3 py-1.5 bg-secondary/50 rounded-full text-sm text-secondary-foreground"
                        >
                          <CheckCircle className="w-3 h-3 text-primary" />
                          {feature.title}
                        </motion.div>
                      ))}
                    </div>
                  </Card>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                >
                  <a href="https://app.seimoney.link" target="_blank">
                    <Button
                      size="lg"
                      className="bg-gradient-primary hover:opacity-90 text-white shadow-primary px-8 py-6 text-lg"
                    >
                      <Rocket className="w-5 h-5 mr-2" />
                      Use Legacy Dashboard
                    </Button>
                  </a>
                  <a
                    href="https://www.youtube.com/playlist?list=PLSIb-ocnnc9Sx549ensIIADCt2xaDWnp_"
                    target="_blank"
                  >
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-primary/20 hover:bg-primary/5 px-8 py-6 text-lg"
                    >
                      Watch Demo
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </a>
                </motion.div>
              </motion.section>

              {/* Features Section */}
              <motion.section
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1 }}
                className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto"
              >
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 + index * 0.2 }}
                    whileHover={{
                      y: -8,
                      transition: {
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                      },
                    }}
                  >
                    <Card className="p-6 text-center bg-card/30 backdrop-blur-sm border-border/50 hover:shadow-accent transition-shadow duration-300">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4 text-white"
                      >
                        {feature.icon}
                      </motion.div>
                      <h3 className="text-lg font-semibold mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {feature.description}
                      </p>
                    </Card>
                  </motion.div>
                ))}
              </motion.section>
            </div>
          </main>

          {/* Footer */}
          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.5 }}
            className="relative z-10 border-t border-border/50 bg-card/30 backdrop-blur-sm mt-20"
          >
            <div className="container mx-auto px-6 py-12">
              <div className="grid md:grid-cols-4 gap-8">
                <div className="col-span-2">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                      SeiMoney
                    </span>
                  </div>
                  <p className="text-muted-foreground mb-4 max-w-md">
                    The most powerful Web3 payment infrastructure built on Sei
                    Network. Empowering creators, businesses, and developers
                    worldwide.
                  </p>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                      Built on Sei Network
                    </span>
                    <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-medium">
                      x402 Protocol
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-4">Products</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>
                      <a
                        href="https://app.seimoney.link"
                        target="_blank"
                        className="hover:text-foreground transition-colors"
                      >
                        Payment Links
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://app.seimoney.link"
                        target="_blank"
                        className="hover:text-foreground transition-colors"
                      >
                        Content Gating
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://app.seimoney.link"
                        target="_blank"
                        className="hover:text-foreground transition-colors"
                      >
                        Payroll
                      </a>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-4">Developers</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>
                      <a
                        href="https://sdk.seimoney.link"
                        target="_blank"
                        className="hover:text-foreground transition-colors"
                      >
                        Documentation
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://sdk.seimoney.link"
                        target="_blank"
                        className="hover:text-foreground transition-colors"
                      >
                        SDK
                      </a>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="border-t border-border/50 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
                <p className="text-muted-foreground text-sm">
                  © 2025 SeiMoney. All rights reserved.
                </p>
                <div className="flex items-center gap-4 mt-4 sm:mt-0">
                  <CreditCard className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground text-sm">
                    Secure payments powered by Sei
                  </span>
                </div>
              </div>
            </div>
          </motion.footer>
        </>
      ) : (
        <>
          {preview ? (
            <main className="relative z-10 bg-gray-50 min-h-[calc(100vh - 80px)]">
              <div className="container px-4 py-8 pr-[240px]">
                {/* Browser-style header */}
                <div className="bg-gray-100 rounded-t-lg border-b border-gray-300 px-4 py-3 flex items-center justify-between">
                  {/* Browser controls */}
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-400 cursor-pointer hover:bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400 cursor-pointer hover:bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400 cursor-pointer hover:bg-green-500"></div>
                  </div>

                  {/* URL bar */}
                  <div className="flex-1 mx-4 bg-white rounded-md px-3 py-1.5 text-sm text-gray-500 truncate">
                    {preview}
                  </div>

                  {/* Action buttons */}
                  <div className="flex space-x-2">
                    <button
                      className="flex items-center space-x-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm transition-colors duration-200"
                      onClick={sharePreview}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                        />
                      </svg>
                      <span>Share</span>
                    </button>

                    <button className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-md transition-colors duration-200">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Preview frame */}
                <div className="bg-white border border-gray-300 border-t-0 rounded-b-lg shadow-sm overflow-hidden">
                  <iframe
                    className="w-full h-[70vh]"
                    src={preview}
                    title="Website preview"
                    sandbox="allow-same-origin allow-scripts allow-forms"
                    loading="lazy"
                  ></iframe>
                </div>

                {/* Preview info */}
                <div className="mt-4 bg-white rounded-lg p-4 shadow-sm">
                  <h3 className="font-medium text-gray-700 mb-2">
                    Preview Information
                  </h3>
                  <p className="text-sm text-gray-600 truncate">
                    <span className="font-medium">URL:</span> {preview}
                  </p>
                </div>
              </div>
            </main>
          ) : (
            <main className="relative z-10 bg-gray-50 min-h-[calc(100vh - 80px)] flex items-center justify-center">
              <div className="container mx-auto px-4 py-20 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-medium text-gray-500 mb-2">
                    No Preview Available
                  </h3>
                </div>
              </div>
            </main>
          )}
        </>
      )}
    </div>
  );
};

export default Home;
