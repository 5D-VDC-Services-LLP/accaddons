import React, { useEffect, useRef, useState } from 'react';

const WorkflowFilter = ({
  filters,
  moduleFilters,
  handleFilterChange,
  addFilter,
  handleDeleteFilter,
  resetFilters,
}) => {
  const filterOptions = Object.keys(moduleFilters);
  const [openDropdownIdx, setOpenDropdownIdx] = useState(null);
  const dropdownRefs = useRef([]);
  const containerRef = useRef(null);

  const singleSelectFilters = ['Created On', 'Due Date', 'Status'];

  const handleClickOutside = (event) => {
    if (
      containerRef.current &&
      !containerRef.current.contains(event.target)
    ) {
      setOpenDropdownIdx(null);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleAttribute = (filterIdx, attrId) => {
    const currentAttributes = Array.isArray(filters[filterIdx].attribute)
      ? filters[filterIdx].attribute
      : [];
    const updatedAttributes = currentAttributes.includes(attrId)
      ? currentAttributes.filter((id) => id !== attrId)
      : [...currentAttributes, attrId];

    handleFilterChange(filterIdx, 'attribute', updatedAttributes);
  };

  return (
    <div
      className="bg-white rounded-lg col-span-2 p-6 shadow-sm self-start"
      ref={containerRef}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-gray-900">Filter</h2>
        <button
          className="text-gray-500 text-sm hover:text-primary"
          onClick={resetFilters}
          type="button"
        >
          Reset
        </button>
      </div>

      {filters.map((filter, idx) => {
        const selectedFilterBys = filters
          .filter((_, i) => i !== idx)
          .map((f) => f.filterBy);

        const availableOptions = filterOptions.filter(
          (option) =>
            !selectedFilterBys.includes(option) || option === filter.filterBy
        );

        const attributes = moduleFilters[filter.filterBy] || [];
        const isMultiSelect = !singleSelectFilters.includes(filter.filterBy);

        const selectedNames = isMultiSelect
          ? attributes
              .flatMap((group) => group.subtypes || group.rootCauses || [])
              .filter((sub) => filter.attribute?.includes(sub.id))
              .map((sub) => ({ id: sub.id, name: sub.name }))
          : [];

        return (
          <div
            className="flex items-start space-x-3 mb-4"
            key={idx}
            ref={(el) => (dropdownRefs.current[idx] = el)}
          >
            {/* Filter By Dropdown */}
            <div className="flex-1 max-w-[30%]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by
              </label>
              <select
                value={filter.filterBy}
                onChange={(e) => {
                  handleFilterChange(idx, 'filterBy', e.target.value);
                  handleFilterChange(
                    idx,
                    'attribute',
                    singleSelectFilters.includes(e.target.value) ? '' : []
                  );
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
              >
                {availableOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {/* Attributes */}
            <div className="flex-1 max-w-[60%] relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select attributes
              </label>

              {isMultiSelect ? (
                <>
                  {/* Scrollable Chip Box */}
                  <div
                    onClick={() =>
                      setOpenDropdownIdx(openDropdownIdx === idx ? null : idx)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md cursor-pointer bg-white flex gap-1 overflow-x-auto"
                    style={{ scrollbarWidth: 'thin' }}
                  >
                    {selectedNames.length > 0 ? (
                      <div className="flex gap-1">
                        {selectedNames.map((attr) => (
                          <span
                            key={attr.id}
                            className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs whitespace-nowrap flex items-center gap-1"
                          >
                            {attr.name}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleAttribute(idx, attr.id);
                              }}
                              className="ml-1 text-blue-700 hover:text-blue-900 font-bold focus:outline-none"
                              aria-label={`Remove ${attr.name}`}
                            >
                              &times;
                            </button>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400">Select options</span>
                    )}
                  </div>

                  {/* Dropdown */}
                  {openDropdownIdx === idx && (
                    <div
                      className={`absolute z-10 w-full max-h-48 overflow-y-auto border border-gray-300 rounded-md bg-white shadow
                        ${dropdownRefs.current[idx]?.getBoundingClientRect().bottom + 200 >
                        window.innerHeight
                          ? 'bottom-full mb-1'
                          : 'top-full mt-1'
                        }`}
                    >
                      {attributes.map((group) => (
                        <div key={group.id}>
                          <div className="px-3 py-2 text-xs font-semibold bg-gray-100 text-gray-600 uppercase">
                            {group.name}
                          </div>
                          {(group.subtypes || group.rootCauses)?.map((sub) => {
                            const isChecked = filter.attribute?.includes(sub.id);
                            return (
                              <button
                                key={sub.id}
                                type="button"
                                onClick={() => toggleAttribute(idx, sub.id)}
                                className={`flex items-center justify-between w-full px-3 py-2 text-left hover:bg-gray-50 ${
                                  isChecked ? 'bg-blue-50' : ''
                                }`}
                              >
                                <span
                                  className={`text-sm ${
                                    isChecked
                                      ? 'text-blue-700 font-medium'
                                      : 'text-gray-700'
                                  }`}
                                >
                                  {sub.name}
                                </span>
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  readOnly
                                  className="form-checkbox text-blue-600 pointer-events-none"
                                />
                              </button>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <select
                  value={filter.attribute || ''}
                  onChange={(e) =>
                    handleFilterChange(idx, 'attribute', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                >
                  <option value="" disabled>
                    Select an option
                  </option>
                  {attributes.map((attr) =>
                    typeof attr === 'string' ? (
                      <option key={attr} value={attr}>
                        {attr}
                      </option>
                    ) : (
                      <option key={attr.id} value={attr.id}>
                        {attr.name}
                      </option>
                    )
                  )}
                </select>
              )}
            </div>

            {/* Delete Filter Button */}
            {idx !== 0 && (
              <div className="flex items-center mt-6">
                <button
                  type="button"
                  onClick={() => handleDeleteFilter(idx)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-300 shadow text-red-500 hover:bg-red-50 hover:text-red-700 transition"
                  title="Delete filter"
                >
                  <span className="text-xl font-bold leading-none">&times;</span>
                </button>
              </div>
            )}
          </div>
        );
      })}

      {/* Add Filter Button */}
      {filters.length < filterOptions.length && (
        <div className="text-primary hover:text-gray-500">
          <button
            className="text-primary text-sm hover:text-gray-500 flex items-center gap-1"
            type="button"
            onClick={addFilter}
          >
            <span>+</span> Filter
          </button>
        </div>
      )}
    </div>
  );
};

export default WorkflowFilter;
