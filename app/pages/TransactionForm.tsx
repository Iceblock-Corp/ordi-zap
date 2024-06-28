"use client";
import { formatUnits } from "viem";
import { useEffect, useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import { AnimatePresence, motion } from "framer-motion";

import { PiCaretDown } from "react-icons/pi";
import { FaRegHourglass } from "react-icons/fa6";
import { AiOutlineQuestionCircle } from "react-icons/ai";

import { erc20Abi } from "../api/abi";
import {
  AnimatedComponent,
  InputError,
  NetworkButton,
  SelectField,
  TabButton,
  Tooltip,
  inputClasses,
  primaryBtnClasses,
  slideInOut,
} from "../components";
import { formatCurrency } from "../utils";
import { InstitutionProps, TransactionFormProps } from "../types";

const tokens = [
  { value: "DAI", label: "DAI" },
  { value: "USDC", label: "USDC", disabled: true },
  { value: "USDT", label: "USDT", disabled: true },
];

const currencies = [
  { value: "NGN", label: "Nigerian Naira (NGN)" },
  { value: "KES", label: "Kenyan Shilling (KES)", disabled: true },
  { value: "GHS", label: "Ghanaian Cedi (GHS)", disabled: true },
];

/**
 * TransactionForm component renders a form for submitting a transaction.
 * It includes fields for selecting network, token, amount, and recipient details.
 * The form also displays rate and fee information based on the selected token.
 *
 * @param formMethods - Form methods from react-hook-form library.
 * @param onSubmit - Function to handle form submission.
 * @param stateProps - State properties for the form.
 */
export const TransactionForm = ({
  formMethods,
  onSubmit,
  stateProps,
}: TransactionFormProps) => {
  // Destructure stateProps
  const {
    fee,
    rate,
    isFetchingRate,
    selectedNetwork,
    handleNetworkChange,
    selectedTab,
    handleTabChange,
    isFetchingInstitutions: institutionsLoading,
    institutions: supportedInstitutions,
  } = stateProps;

  // Get account information using custom hook
  const account = useAccount();

  // Get token balance using custom hook and Ethereum contract interaction
  const { data: tokenBalanceInWei } = useReadContract({
    abi: erc20Abi,
    address: "0x7683022d84F726a96c4A6611cD31DBf5409c0Ac9",
    functionName: "balanceOf",
    args: [account.address!],
  });

  // State for token balance
  const [tokenBalance, setTokenBalance] = useState<number>(0);

  // Destructure formMethods from react-hook-form
  const {
    handleSubmit,
    register,
    watch,
    formState: { errors, isValid, isDirty, isSubmitting },
  } = formMethods;

  // Get values of currency, amount, and token from form
  let currency = watch("currency"),
    amount = watch("amount"),
    token = watch("token");

  // Array of objects for rendering rate and fee information
  const renderedInfo = [
    {
      key: "rate",
      label: "Rate",
      value: `${formatCurrency(rate, currency?.toString(), currency ? `en-${currency.toString().slice(0, 2)}` : "en-NG")}/DAI`,
    },
    {
      key: "fee",
      label: "Fee",
      value: `${fee} ${token}`,
    },
  ];

  // Array of available networks
  const networks = ["base", "arbitrum", "polygon"];

  // Update token balance when token balance is available
  useEffect(() => {
    if (tokenBalanceInWei) {
      setTokenBalance(Number(formatUnits(tokenBalanceInWei, 18)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenBalanceInWei]);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid gap-6 py-10 text-sm text-neutral-900 transition-all dark:text-white"
      noValidate
    >
      {/* Networks */}
      <div className="flex items-center justify-between gap-3 font-medium">
        <input type="hidden" {...register("network")} value={selectedNetwork} />

        {/* Render network buttons */}
        {networks.map((network) => (
          <NetworkButton
            key={network}
            network={network}
            logo={`/${network}-logo.svg`}
            alt={`${network} logo`}
            selectedNetwork={selectedNetwork}
            handleNetworkChange={handleNetworkChange}
            disabled={network !== "base"}
          />
        ))}

        {/* Other network buttons */}
        <Tooltip message="Other networks (coming soon)">
          <button
            type="button"
            aria-label="Other networks (coming soon)"
            className="flex items-center justify-center gap-2 rounded-full border border-gray-300 p-2.5 opacity-70 dark:border-white/20"
          >
            <PiCaretDown className="text-lg text-gray-400 dark:text-white/50" />
          </button>
        </Tooltip>
      </div>

      <div className="flex items-start gap-4">
        {/* Token */}
        <div className="grid flex-1 gap-2">
          <SelectField
            id="token"
            label="Token"
            options={tokens}
            defaultValue="DAI"
            validation={{
              required: { value: true, message: "Token is required" },
            }}
            errors={errors}
            register={register}
            value={watch("token")}
          />

          {/* Display token balance if account is connected */}
          {account.status === "connected" && (
            <p className="text-gray-500 dark:text-white/50">
              Bal: {tokenBalance} {token}
            </p>
          )}
        </div>

        {/* Amount */}
        <div className="grid flex-1 gap-2">
          <label htmlFor="amount" className="font-medium">
            Amount <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              id="amount"
              type="number"
              step="0.01"
              {...register("amount", {
                required: { value: true, message: "Amount is required" },
                disabled: watch("token") === "",
                min: {
                  value: 0.01,
                  message: `Minimum amount is 0.01 ${token}`,
                },
                max: {
                  value: 500,
                  message: `Max. amount is 500 ${token}`,
                },
                pattern: {
                  value: /^\d+(\.\d{1,2})?$/,
                  message: "Invalid amount",
                },
              })}
              className={`${inputClasses} pl-4 pr-14`}
              placeholder="0.00"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-4">
              {watch("token")}
            </div>
          </div>
          {errors.amount && <InputError message={errors.amount.message} />}
        </div>
      </div>

      <div>
        <h3 className="pb-2 font-medium">
          Recipient details <span className="text-rose-500">*</span>
        </h3>

        <div className="grid gap-4 rounded-3xl border border-gray-200 p-4 transition-all dark:border-white/10">
          {/* Tabs */}
          <div className="flex items-center gap-2 rounded-full bg-gray-50 p-1 font-medium dark:bg-white/5">
            <TabButton
              tab="bank-transfer"
              selectedTab={selectedTab}
              handleTabChange={handleTabChange}
            />
            <TabButton
              tab="mobile-money"
              selectedTab={selectedTab}
              handleTabChange={handleTabChange}
            />
          </div>

          {/* Bank Transfer Tab Contents */}
          {selectedTab === "bank-transfer" && (
            <motion.div
              key="bank-transfer"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="grid gap-4"
            >
              {/* Currency */}
              <SelectField
                id="currency"
                label="Currency"
                defaultValue="NGN"
                options={currencies}
                validation={{
                  required: { value: true, message: "Select currency" },
                }}
                errors={errors}
                register={register}
                value={watch("currency")}
              />

              {/* Recipient Bank */}
              <SelectField
                id="institution"
                label="Recipient Bank"
                options={supportedInstitutions.map(
                  (institution: InstitutionProps) => ({
                    value: institution.code,
                    label: institution.name,
                  }),
                )}
                validation={{
                  required: { value: true, message: "Select recipient bank" },
                  disabled: watch("currency") === "" || institutionsLoading,
                }}
                errors={errors}
                register={register}
                isLoading={institutionsLoading}
                value={watch("institution")}
              />

              {/* Recipient Account */}
              <div className="grid gap-2">
                <label htmlFor="recipient-account" className="font-medium">
                  Recipient Account <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="recipient-account"
                    {...register("accountIdentifier", {
                      required: {
                        value: true,
                        message: "Enter recipient account",
                      },
                      pattern: {
                        value: /\d{10}/,
                        message: "Invalid account number",
                      },
                    })}
                    className={inputClasses}
                    placeholder="12345678901"
                    maxLength={10}
                    pattern="\d{10}"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 dark:text-white/20">
                    {10 - (watch("accountIdentifier")?.toString().length ?? 0)}
                  </div>
                </div>
                {errors.accountIdentifier && (
                  <InputError message={errors.accountIdentifier.message} />
                )}
                {!errors.accountIdentifier && (
                  <div className="flex items-center gap-1 text-gray-400 dark:text-white/50">
                    <AiOutlineQuestionCircle />
                    <p>Usually 10 digits.</p>
                  </div>
                )}
              </div>

              {/* Hidden field for recipient name */}
              <input
                type="hidden"
                {...register("recipientName")}
                value="John Doe"
              />

              {/* Memo */}
              <div className="grid gap-2">
                <label htmlFor="memo" className="font-medium">
                  Memo <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="memo"
                    {...register("memo", {
                      required: { value: true, message: "Enter memo" },
                    })}
                    className={inputClasses}
                    placeholder="Enter memo"
                    maxLength={25}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 dark:text-white/20">
                    {25 - (watch("memo")?.toString().length ?? 0)}
                  </div>
                </div>
                {errors.memo && <InputError message={errors.memo.message} />}
              </div>
            </motion.div>
          )}

          {/* Mobile Money Tab Contents */}
          {selectedTab === "mobile-money" && (
            <motion.div
              key="mobile-money"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center gap-2 rounded-xl border border-gray-200 px-6 py-5 dark:border-white/10"
            >
              <FaRegHourglass className="text-yellow-700 dark:text-yellow-400" />
              <p className="text-gray-500">Coming soon</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={!isValid || !isDirty || !account.isConnected}
        className={primaryBtnClasses}
      >
        {account.isConnected ? "Review Info" : "Connect wallet to continue"}
      </button>

      {/* Rate, Fee and Amount calculations */}
      <AnimatePresence>
        {rate > 0 && Number(amount) > 0 && (
          <AnimatedComponent
            variant={slideInOut}
            className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 transition-all dark:border-white/10 dark:bg-white/5"
          >
            {renderedInfo.map(({ key, label, value }, index) => (
              <AnimatedComponent
                key={key}
                delay={index * 0.1}
                className={`flex items-center justify-between border-dashed border-white/10 px-4 py-3 font-normal text-gray-500 transition-all dark:text-white/50 ${index === 1 ? "border-t" : ""}`}
              >
                <p>{label}</p>
                <p
                  className={`rounded-full px-2 py-1 transition-all ${
                    isFetchingRate
                      ? "animate-pulse bg-gradient-to-r from-white to-gray-100 dark:from-neutral-800 dark:to-neutral-900"
                      : "bg-white dark:bg-neutral-900"
                  }`}
                >
                  <span className={`${isFetchingRate ? "blur-xl" : ""}`}>
                    {value}
                  </span>
                </p>
              </AnimatedComponent>
            ))}
          </AnimatedComponent>
        )}
      </AnimatePresence>
    </form>
  );
};
