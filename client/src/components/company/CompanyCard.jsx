// components/CompanyCard.jsx
const CompanyCard = ({ logo, slug, onClick, loading }) => {
  return (
    <div
      onClick={onClick}
      className={`group cursor-pointer relative overflow-hidden bg-white bg-opacity-30 border border-gray-200 rounded-3xl p-10 transition-all duration-300 hover:bg-white hover:shadow-xl hover:scale-105 flex flex-col justify-between items-center min-w-[180px] ${
        loading ? 'cursor-not-allowed opacity-70' : ''
      }`}
    >
      <div className="flex items-center justify-center aspect-square">
        <img
          src={logo}
          alt={`${slug} logo`}
          className="max-h-full w-auto transition duration-300 group-hover:brightness-200 group-hover:scale-105"
        />
      </div>
    </div>
  );
};

export default CompanyCard;