'use client'

import React, { useEffect, useId, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useOutsideClick } from '@/hooks/use-outside-click'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface BentoGridProps {
    items: {
        id: string | number
        title: string
        subtitle?: string
        description?: string
        content: React.ReactNode
        icon?: React.ReactNode
        className?: string
    }[]
}

export default function ExpandableBentoGrid({ items }: BentoGridProps) {
    const [active, setActive] = useState<(typeof items)[number] | boolean | null>(null)
    const ref = useRef<HTMLDivElement>(null)
    const id = useId()

    useEffect(() => {
        function onKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                setActive(false)
            }
        }

        if (active && typeof active === 'object') {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'auto'
        }

        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [active])

    useOutsideClick(ref, () => setActive(null))

    return (
        <>
            <AnimatePresence>
                {active && typeof active === 'object' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/10 dark:bg-black/40 backdrop-blur-md h-full w-full z-[10000]"
                    />
                )}
            </AnimatePresence>
            <AnimatePresence>
                {active && typeof active === 'object' ? (
                    <div className="fixed inset-0 top-16 grid place-items-center z-[10001] p-4">
                        <motion.button
                            key={`button-${active.title}-${id}`}
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, transition: { duration: 0.05 } }}
                            className="flex absolute top-2 right-2 md:right-10 items-center justify-center bg-white dark:bg-neutral-800 rounded-full h-8 w-8 shadow-md z-[10002]"
                            onClick={() => setActive(null)}
                        >
                            <X className="h-4 w-4 text-black dark:text-white" />
                        </motion.button>
                        <motion.div
                            layoutId={`card-${active.title}-${id}`}
                            ref={ref}
                            className="w-full max-w-[500px] h-full md:h-fit md:max-h-[90%] flex flex-col bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md sm:rounded-3xl overflow-hidden shadow-2xl border border-gray-100/50 dark:border-gray-800/50"
                            transition={{ type: "spring", stiffness: 95, damping: 19 }}
                        >
                            <motion.div layoutId={`image-${active.title}-${id}`}>
                                <div className="w-full h-40 md:h-50 lg:h-60 bg-primary-100 dark:bg-primary-950/20 flex items-center justify-center perspective-distant transform-3d">
                                    {active.icon ? (
                                        <div className="scale-[2] text-primary-500">{active.icon}</div>
                                    ) : (
                                        <div className="w-full h-full bg-gray-200 dark:bg-gray-800" />
                                    )}
                                </div>
                            </motion.div>

                            <div>
                                <div className="flex justify-between p-6 items-center">
                                    <div>
                                        <motion.h3
                                            layoutId={`title-${active.title}-${id}`}
                                            className="font-bold text-neutral-800 dark:text-neutral-200 text-lg"
                                        >
                                            {active.title}
                                        </motion.h3>
                                        <motion.p
                                            layoutId={`description-${active.title}-${id}`}
                                            className="text-neutral-600 dark:text-neutral-400 text-sm mt-1"
                                        >
                                            {active.description}
                                        </motion.p>
                                    </div>

                                    <motion.button
                                        layoutId={`button-${active.title}-${id}`}
                                        onClick={() => setActive(null)}
                                        className="px-4 py-2 text-sm rounded-xl font-bold bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors"
                                    >
                                        Close
                                    </motion.button>
                                </div>

                                <div className="pt-2 px-6 flex justify-center mx-auto overflow-auto">
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="text-neutral-600 text-sm h-40 md:h-fit pb-6 flex flex-col items-start gap-4 dark:text-neutral-400 overflow-y-auto"
                                    >
                                        {active.content}
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                ) : null}
            </AnimatePresence>
            <ul className="max-w-4xl mx-auto w-full gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 items-start">
                {items.map((item) => (
                    <motion.div
                        layoutId={`card-${item.title}-${id}`}
                        key={item.id}
                        onClick={() => setActive(item)}
                        whileHover={{ y: -4, scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 120, damping: 18 }}
                        className={cn(
                            "p-5 flex flex-col justify-between items-center bg-white/60 dark:bg-neutral-900/40 backdrop-blur-sm rounded-3xl cursor-pointer border border-neutral-100/60 dark:border-neutral-800/40 shadow-sm hover:shadow-lg transition-shadow duration-300",
                            item.className
                        )}
                    >
                        <div className="flex flex-col items-center text-center gap-4">
                            <motion.div layoutId={`image-${item.title}-${id}`}>
                                <div className="h-14 w-14 rounded-xl bg-primary-100/70 dark:bg-primary-950/40 flex items-center justify-center text-primary-600 dark:text-primary-400 p-2">
                                    {item.icon}
                                </div>
                            </motion.div>
                            <div>
                                <motion.h3
                                    layoutId={`title-${item.title}-${id}`}
                                    className="font-semibold text-neutral-800 dark:text-neutral-200"
                                >
                                    {item.title}
                                </motion.h3>
                                <motion.p
                                    layoutId={`description-${item.title}-${id}`}
                                    className="text-neutral-600 dark:text-neutral-400 text-xs mt-1"
                                >
                                    {item.subtitle}
                                </motion.p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </ul>
        </>
    )
}
