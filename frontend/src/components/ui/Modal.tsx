'use client'

import { Fragment, ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './Button'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  showCloseButton?: boolean
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
  footer?: ReactNode
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  footer,
}: ModalProps) {
  if (!isOpen) return null

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-4xl',
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && closeOnEscape) {
      onClose()
    }
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose()
    }
  }

  return (
    <Fragment>
      <div
        className="fixed inset-0 z-50 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        aria-describedby={description ? 'modal-description' : undefined}
      >
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={handleOverlayClick} />
        
        <div className="flex min-h-full items-center justify-center p-4">
          <div
            className={cn(
              'relative w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl',
              'transform transition-all duration-200',
              'animate-scale-in',
              sizes[size]
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {(title || showCloseButton) && (
              <div className="flex items-start justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div>
                  {title && (
                    <h2 id="modal-title" className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p id="modal-description" className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {description}
                    </p>
                  )}
                </div>
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    aria-label="Close modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}
            
            <div className="p-6">
              {children}
            </div>
            
            {footer && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>
    </Fragment>
  )
}

interface AlertDialogProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  isLoading?: boolean
  variant?: 'destructive' | 'primary'
}

export function AlertDialog({
  isOpen,
  onClose,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  isLoading,
  variant = 'destructive',
}: AlertDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose} disabled={isLoading}>
          {cancelText}
        </Button>
        <Button variant={variant} onClick={onConfirm} isLoading={isLoading}>
          {confirmText}
        </Button>
      </div>
    </Modal>
  )
}