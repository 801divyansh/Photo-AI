"use client";

import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { Credits } from "./navbar/Credits";
import Link from "next/link";
import { motion } from "framer-motion";
import { ThemeToggle } from "./ThemeToggle";

export function Appbar() {
  return (
    <div className="bg-black">
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed top-0 z-50 w-full p-2"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="px-4 sm:px-6 lg:px-8 backdrop-blur-xl rounded-2xl bg-background/50 border border-neutral-300 dark:border-neutral-900 shadow-lg"
        >
          <div className="flex h-16 items-center justify-between">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/" className="flex items-center space-x-1 transition-opacity hover:opacity-90">
                <span className="font-bold font-mono text-xl sm:inline-block">
                  Photo <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">AI</span>
                </span>
              </Link>
            </motion.div>

            <div className="flex items-center md:gap-4 gap-3">
              <SignedIn>
                <Button
                  variant="ghost"
                  size="sm"
                  className="dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition"
                  asChild
                >
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <Button 
                  variant="ghost"
                  size="sm"
                  className="dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition"
                  asChild
                >
                  <Link href="/purchases">My Purchases</Link>
                </Button>
                <Credits />
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "rounded-full",
                      userButtonAvatar: "rounded-full",
                      userButtonUsername: "font-semibold text-sm",
                      userButtonDetails: "text-xs text-neutral-500",
                      userButtonPopoverCard: "rounded-lg shadow-md",
                      userButtonPopoverCardHeader:
                        "rounded-tl-lg rounded-tr-lg bg-neutral-200 dark:bg-neutral-800",
                      userButtonPopoverCardFooter:
                        "rounded-bl-lg rounded-br-lg bg-neutral-200 dark:bg-neutral-800",
                      userButtonPopoverPrimaryAction:
                        "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:bg-opacity-90",
                    },
                  }}
                  showName={false}  
                />
              </SignedIn>

              <SignedOut>
              <Button
                  variant="ghost"
                  size="sm"
                  className="dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition"
                  asChild
                >
                  <Link href="/pricing">Pricing</Link>
                </Button>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="default"
                    size="sm"
                    className="relative overflow-hidden bg-gradient-to-r from-neutral-800 to-neutral-900 text-white dark:from-neutral-700 dark:to-neutral-800 border border-neutral-600 dark:border-neutral-700 rounded-lg shadow-md shadow-neutral-800/20 dark:shadow-black/30 px-4 py-2 font-medium tracking-wide transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-[1.02] hover:from-neutral-700 hover:to-neutral-900 dark:hover:from-neutral-600 dark:hover:to-neutral-750"
                    asChild
                  >
                    <SignInButton mode="modal">
                      <span className="cursor-pointer">Sign In</span>
                    </SignInButton>
                  </Button>
                </motion.div>
              </SignedOut>
              <ThemeToggle />
            </div>
          </div>
        </motion.div>
      </motion.header>
    </div>
  );
}
