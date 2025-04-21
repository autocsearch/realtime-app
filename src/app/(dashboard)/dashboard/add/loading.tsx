import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function addLoading() {
  return (
    <div className="w-full flex flex-col gap-3">
      <Skeleton className="mb-4" height={60} width={500} />
      <Skeleton height={20} width={150} />
      <Skeleton height={40} width={410} />
      <Skeleton height={30} width={100} />
    </div>
  );
}
