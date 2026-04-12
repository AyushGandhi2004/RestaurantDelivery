const OfferBadge = ({ label }) => {
  if (!label) return null;
  return (
    <span className="badge bg-amber-100 text-amber-800 font-semibold">
      {label}
    </span>
  );
};

export default OfferBadge;