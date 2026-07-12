"use client";
 
import { motion, AnimatePresence } from "framer-motion";
import React, { useState } from "react";
import { cn } from "@/lib/utils";

export interface SocialItem {
    letter: string;
    icon: React.ReactNode;
    label: string;
    href?: string;
    onClick?: () => void;
}

interface SocialFlipButtonProps {
    items?: SocialItem[];
    className?: string;
    itemClassName?: string;
    frontClassName?: string;
    backClassName?: string;
}

const defaultItems: SocialItem[] = [
    { 
        letter: "C", 
        icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>, 
        label: "Github", 
        href: "https://github.com" 
    },
    { 
        letter: "O", 
        icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg>, 
        label: "Twitter", 
        href: "https://twitter.com" 
    },
    { 
        letter: "N", 
        icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>, 
        label: "LinkedIn", 
        href: "https://linkedin.com" 
    },
    { 
        letter: "T", 
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>, 
        label: "Instagram", 
        href: "https://instagram.com" 
    },
    { 
        letter: "A", 
        icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>, 
        label: "Facebook", 
        href: "https://facebook.com" 
    },
    { 
        letter: "C", 
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>, 
        label: "Email", 
        href: "mailto:support@sreebalajiframes.com" 
    },
    { 
        letter: "T", 
        icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028 14.09 14.09 0 001.226-1.994.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.894.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.92 1.793 8.18 1.793 12.061 0a.074.074 0 01.078.009c.12.099.244.2.372.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.894.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.156 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.156 2.418z" /></svg>, 
        label: "Discord", 
        href: "https://discord.com" 
    },
];

const SocialFlipNode = ({
    item,
    index,
    isHovered,
    setTooltipIndex,
    tooltipIndex,
    itemClassName,
    frontClassName,
    backClassName,
}: {
    item: SocialItem;
    index: number;
    isHovered: boolean;
    setTooltipIndex: (val: number | null) => void;
    tooltipIndex: number | null;
    itemClassName?: string;
    frontClassName?: string;
    backClassName?: string;
}) => {
    const Wrapper = item.href ? "a" : "div";
    const wrapperProps = item.href
        ? { href: item.href, target: "_blank", rel: "noopener noreferrer" }
        : { onClick: item.onClick };

    return (
        <Wrapper
            {...wrapperProps}
            className={cn("relative h-10 w-10 cursor-pointer", itemClassName)}
            style={{ perspective: "1000px" }}
            onMouseEnter={() => setTooltipIndex(index)}
            onMouseLeave={() => setTooltipIndex(null)}
        >
            <AnimatePresence>
                {isHovered && tooltipIndex === index && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.8, x: "-50%" }}
                        animate={{ opacity: 1, y: -50, scale: 1, x: "-50%" }}
                        exit={{ opacity: 0, y: 10, scale: 0.8, x: "-50%" }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute left-1/2 z-50 whitespace-nowrap rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white shadow-xl dark:bg-white dark:text-neutral-900"
                    >
                        {item.label}
                        {/* Arrow */}
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-2 w-2 rotate-45 bg-neutral-900 dark:bg-white" />
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                className="relative h-full w-full"
                initial={false}
                animate={{ rotateY: isHovered ? 180 : 0 }}
                transition={{
                    duration: 0.8,
                    type: "spring",
                    stiffness: 90,
                    damping: 18,
                    delay: index * 0.08,
                }}
                style={{ transformStyle: "preserve-3d" }}
            >
                {/* Front - Letter */}
                <div
                    className={cn(
                        "absolute inset-0 flex items-center justify-center rounded-lg bg-neutral-100 text-lg font-bold text-neutral-800 shadow-sm dark:bg-neutral-900 dark:text-neutral-200",
                        frontClassName
                    )}
                    style={{ backfaceVisibility: "hidden" }}
                    
                >
                    {item.letter}
                </div>

                {/* Back - Icon */}
                <div
                    className={cn(
                        "absolute inset-0 flex items-center justify-center rounded-lg bg-black text-lg text-white dark:bg-white dark:text-black",
                        backClassName
                    )}
                    style={{
                        backfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                    }}
                >
                    {item.icon}
                </div>
            </motion.div>
        </Wrapper>
    );
};

export default function SocialFlipButton({
    items = defaultItems,
    className,
    itemClassName,
    frontClassName,
    backClassName,
}: SocialFlipButtonProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [tooltipIndex, setTooltipIndex] = useState<number | null>(null);

    return (
        <div className={cn("flex items-center justify-center gap-4 p-4", className)}>
            <div
                className="group relative flex items-center justify-center gap-2 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white p-4 shadow-sm dark:bg-black"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => {
                    setIsHovered(false);
                    setTooltipIndex(null);
                }}
            >
                {/* Border Lines Container - Clipped */}
                <div className="absolute -inset-[1px] overflow-hidden rounded-2xl pointer-events-none">
                    {/* Animated Top Border Line */}
                    <motion.div
                        className="absolute top-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-black/50 to-transparent dark:via-white/50"
                        animate={{ x: ["-100%", "100%"] }}
                        transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            ease: "linear",
                        }}
                    />

                    {/* Animated Bottom Border Line */}
                    <motion.div
                        className="absolute bottom-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-black/50 to-transparent dark:via-white/50"
                        animate={{ x: ["100%", "-100%"] }}
                        transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            ease: "linear",
                        }}
                    />
                </div>

                {items.map((item, index) => (
                    <SocialFlipNode
                        key={index}
                        item={item}
                        index={index}
                        isHovered={isHovered}
                        setTooltipIndex={setTooltipIndex}
                        tooltipIndex={tooltipIndex}
                        itemClassName={itemClassName}
                        frontClassName={frontClassName}
                        backClassName={backClassName}
                    />
                ))}
            </div>
        </div>
    );
}
