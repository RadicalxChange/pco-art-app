import Image from "next/image";
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
    <div className="my-5 flex gap-5">
      {index > 0 && (
        <button
          className="absolute bg-transparent mt-1"
          onClick={() => {
            // Remove item from watchAllocation
            setValue(
              `beneficiary.allocation`,
              watchAllocation?.toSpliced(index, 1)
            );
          }}
        >
          <Image src="/cancel.svg" alt="Cancel" width={24} height={24} />
        </button>
      )}
      <input
        {...register(`beneficiary.allocation.${index}.subscriber`)}
        type="text"
        required
        pattern="^(0x)?[0-9a-fA-F]{40}$"
        placeholder="0x"
        className="bg-transparent border-solid border-0 border-b border-black p-0 focus:outline-none focus:ring-0 focus:border-black font-serif text-xl placeholder-[#ADADAD]"
        style={{
          marginLeft: index > 0 ? 28 : "",
          width: index > 0 ? "calc(100% - 50px)" : "100%",
        }}
      />
      <input
        {...register(`beneficiary.allocation.${index}.units`, {
          valueAsNumber: true,
        })}
        type="number"
        min={0}
        required
        placeholder="5"
        className="w-4/12 bg-transparent border-solid border-0 border-b border-black p-0 focus:outline-none focus:ring-0 focus:border-black font-serif text-xl placeholder-[#ADADAD]"
      />
      <input
        type="text"
        value={`${percentage}%`}
        disabled
        placeholder="5%"
        className="w-4/12 bg-transparent border-solid border-0 border-b border-black p-0 focus:outline-none focus:ring-0 focus:border-black font-serif text-xl placeholder-[#ADADAD]"
      />
    </div>
  );
}
