const SkeletonCard = () => (
  <div className="card p-4 animate-pulse">
    <div className="bg-gray-200 rounded-lg h-40 w-full mb-3" />
    <div className="bg-gray-200 rounded h-4 w-3/4 mb-2" />
    <div className="bg-gray-200 rounded h-3 w-full mb-1" />
    <div className="bg-gray-200 rounded h-3 w-2/3 mb-4" />
    <div className="flex items-center justify-between">
      <div className="bg-gray-200 rounded h-5 w-16" />
      <div className="bg-gray-200 rounded-lg h-8 w-24" />
    </div>
  </div>
);

export default SkeletonCard;