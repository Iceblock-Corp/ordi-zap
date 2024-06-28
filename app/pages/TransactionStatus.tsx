"use client";
import Image from "next/image";
import { useTheme } from "next-themes";
import { AnimatePresence } from "framer-motion";
import { PiCheckCircle, PiSpinnerBold, PiXCircle } from "react-icons/pi";

import { TransactionStatusProps } from "../types";
import {
  AnimatedComponent,
  scaleInOut,
  secondaryBtnClasses,
  fadeInOut,
  slideInOut,
} from "../components";

/**
 * Renders the transaction status component.
 *
 * @param transactionStatus - The status of the transaction.
 * @param errorMessage - The error message, if any.
 * @param createdAt - The creation date of the transaction.
 * @param clearForm - Function to clear the form.
 * @param clearTransactionStatus - Function to clear the transaction status.
 * @param formMethods - The form methods.
 */
export default function TransactionStatus({
  transactionStatus,
  createdAt,
  clearForm,
  clearTransactionStatus,
  formMethods,
}: TransactionStatusProps) {
  const { resolvedTheme } = useTheme();

  const { watch } = formMethods;

  const token = watch("token"),
    recipientName = watch("recipientName"),
    amount = watch("amount");

  /**
   * Handles the back button click event.
   * Clears the transaction status if it's refunded, otherwise clears the form and transaction status.
   */
  const handleBackButtonClick = () => {
    if (transactionStatus === "refunded") {
      clearTransactionStatus();
    } else {
      clearForm();
      clearTransactionStatus();
    }
  };

  /**
   * Returns the image source based on the transaction status and theme.
   * @returns The image source.
   */
  const getImageSrc = () => {
    const base = transactionStatus === "pending" ? "/stepper" : "/stepper-long";
    const themeSuffix = resolvedTheme === "dark" ? "-dark.svg" : ".svg";
    return base + themeSuffix;
  };

  /**
   * Renders the status indicator based on the transaction status.
   * @returns The status indicator component.
   */
  const StatusIndicator = () => (
    <AnimatePresence mode="wait">
      {transactionStatus === "settled" ? (
        <AnimatedComponent variant={scaleInOut} key="settled">
          <Image
            src="/checkmark.svg"
            alt="Checkmark"
            width={24}
            height={24}
            className="h-auto w-10"
          />
        </AnimatedComponent>
      ) : transactionStatus === "refunded" ? (
        <AnimatedComponent
          variant={{
            ...scaleInOut,
            animate: { scale: 1, rotate: 0 },
            initial: { scale: 0, rotate: -90 },
            exit: { scale: 0, rotate: 90 },
          }}
          key="refunded"
        >
          <PiXCircle className="text-4xl text-rose-500" />
        </AnimatedComponent>
      ) : (
        <AnimatedComponent
          variant={fadeInOut}
          key="pending"
          className="flex items-center gap-1 rounded-full bg-yellow-50 px-2 py-1 dark:bg-white/10"
        >
          <PiSpinnerBold className="animate-spin text-yellow-700 dark:text-yellow-400" />
          <p className="text-yellow-900 dark:text-yellow-400">
            {transactionStatus}
          </p>
        </AnimatedComponent>
      )}
    </AnimatePresence>
  );

  return (
    <AnimatedComponent
      variant={slideInOut}
      className="flex w-full items-center justify-between gap-10 text-sm"
    >
      <div className="flex flex-col gap-2">
        <div className="flex w-fit flex-col items-end gap-2">
          {/* Token and Amount */}
          <AnimatedComponent
            variant={slideInOut}
            delay={0.2}
            className="flex items-center gap-1 rounded-full bg-gray-50 px-2 py-1 dark:bg-white/5"
          >
            <Image
              src={`${token}-logo.svg`}
              alt={`${token} logo`}
              width={14}
              height={14}
            />
            <p className="whitespace-nowrap pr-4 font-medium">
              {amount} {token}
            </p>
          </AnimatedComponent>
          {/* Transaction Progress */}
          <Image
            src={getImageSrc()}
            alt="Progress"
            width={200}
            height={200}
            className="w-auto"
          />
          {/* Recipient Name */}
          <AnimatedComponent
            variant={slideInOut}
            delay={0.4}
            className="whitespace-nowrap rounded-full bg-gray-50 px-2 py-1 dark:bg-white/5"
          >
            {recipientName}
          </AnimatedComponent>
        </div>
      </div>

      <div className="flex flex-col items-start gap-4">
        {/* Status Indicator */}
        <StatusIndicator />

        {/* Transaction Status */}
        <AnimatedComponent
          variant={slideInOut}
          delay={0.2}
          className="text-xl font-medium text-neutral-900 dark:text-white"
        >
          {transactionStatus === "pending"
            ? "Processing payment..."
            : transactionStatus === "refunded"
              ? "Payment refunded"
              : "Payment completed"}
        </AnimatedComponent>

        {/* Pending Transaction Separator */}
        {transactionStatus === "pending" && (
          <hr className="w-full border-dashed border-gray-200 dark:border-white/10" />
        )}

        {/* Transaction Status Message */}
        <AnimatedComponent
          variant={slideInOut}
          delay={0.4}
          className="leading-normal text-gray-500 dark:text-white/50"
        >
          {transactionStatus === "pending"
            ? `Processing payment to ${recipientName}. Hang on, this will only take a few seconds.`
            : transactionStatus === "refunded"
              ? `Your payment of ${amount} ${token} to ${recipientName} was unsuccessful. Please try again later or contact support for assistance.`
              : `Your payment of ${amount} ${token} to ${recipientName} has been completed successfully`}
        </AnimatedComponent>

        {/* Back Button */}
        <AnimatePresence>
          {transactionStatus !== "pending" && (
            <>
              <AnimatedComponent
                variant={slideInOut}
                delay={0.5}
                className="flex w-full gap-3"
              >
                <button
                  onClick={handleBackButtonClick}
                  type="button"
                  className={`w-fit ${secondaryBtnClasses}`}
                >
                  {transactionStatus === "refunded"
                    ? "Try again"
                    : "Back to home"}
                </button>
              </AnimatedComponent>
            </>
          )}
        </AnimatePresence>

        {/* Payment Details */}
        <AnimatePresence>
          {transactionStatus === "settled" && (
            <AnimatedComponent
              variant={{
                ...fadeInOut,
                animate: { opacity: 1, height: "auto" },
                initial: { opacity: 0, height: 0 },
                exit: { opacity: 0, height: 0 },
              }}
              delay={0.7}
              className="flex w-full flex-col gap-4 text-neutral-900 dark:text-white/50"
            >
              <div className="flex items-center justify-between gap-1">
                <p className="flex-1">Status</p>
                <div className="flex flex-1 items-center gap-1">
                  <PiCheckCircle className="text-green-700 dark:text-green-500" />
                  <p className="text-green-900 dark:text-green-500">Settled</p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-1">
                <p className="flex-1">Created</p>
                <p className="flex-1">{createdAt}</p>
              </div>
            </AnimatedComponent>
          )}
        </AnimatePresence>
      </div>
    </AnimatedComponent>
  );
}
