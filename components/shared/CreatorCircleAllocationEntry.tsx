import { UseFormRegister, useFormContext } from "react-hook-form";

export default function CreatorCircleAllocationEntry({
  index,
  register,
  totalUnits,
}: {
  index: number;
  register: UseFormRegister<any>;
  totalUnits: number;
}) {
  const { watch, setValue } = useFormContext();
  const watchAllocation = watch(`beneficiary.allocation`);
  const percentageNum = watchAllocation
    ? (watchAllocation[index].units * 100) / totalUnits
    : undefined;
  let percentage: string;
  if (percentageNum === undefined || isNaN(percentageNum)) {
    percentage = "";
  } else {
    percentage = `${percentageNum.toFixed(0)}`;
  }

  return (
    <div className="mb-6 flex">
      {index > 0 && (
        <button
          className="btn btn-sm mx-5 bg-gradient-to-r from-red-500 to-red-400 text-white"
          onClick={() => {
            // Remove item from watchAllocation
            setValue(
              `beneficiary.allocation`,
              watchAllocation?.toSpliced(index, 1)
            );
          }}
        >
          -
        </button>
      )}
      <input
        {...register(`beneficiary.allocation.${index}.subscriber`)}
        type="text"
        id="name"
        className="mx-1 grow rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
        placeholder="0x"
        required
        pattern="^(0x)?[0-9a-fA-F]{40}$"
      />
      <input
        {...register(`beneficiary.allocation.${index}.units`, {
          valueAsNumber: true,
        })}
        type="number"
        id="name"
        className="mx-1 w-20 rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
        required
      />
      <input
        type="text"
        id="name"
        className="dark:text-white-500 mx-1 w-20 rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-500 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
        disabled
        value={`${percentage}%`}
      />
    </div>
  );
}
