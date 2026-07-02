const Pagination = () => {
  return (
    <div className="flex justify-center items-center gap-2 mt-4">
      {[1, 2, 3, 4, 5].map((num) => (
        <button
          key={num}
          className={`w-8 h-8 rounded border text-sm ${
            num === 2 ? "bg-blue-500 text-white" : "bg-white text-gray-700"
          }`}
        >
          {num}
        </button>
      ))}
    </div>
  );
};

export default Pagination;
