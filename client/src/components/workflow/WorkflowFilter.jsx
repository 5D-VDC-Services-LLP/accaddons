import React, { useEffect, useRef, useState } from 'react';

const WorkflowFilter = ({
  filters,
  moduleFilters,
  handleFilterChange,
  addFilter,
  handleDeleteFilter,
  resetFilters,
}) => {
  if (!moduleFilters || typeof moduleFilters !== 'object') {
    return (
      <div className="p-6 text-gray-500">
        Loading filters...
      </div>
    );
  }

  const filterOptions = Object.keys(moduleFilters);
  const [openDropdownIdx, setOpenDropdownIdx] = useState(null);
  const [searchQueries, setSearchQueries] = useState({}); // 🆕 one searchQuery per dropdown
  const dropdownRefs = useRef([]);
  const containerRef = useRef(null);

  const singleSelectFilters = ['Created On', 'Due Date', 'Status', 'Next Step Due Date'];

  const handleClickOutside = (event) => {
    if (containerRef.current && !containerRef.current.contains(event.target)) {
      setOpenDropdownIdx(null);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const renderAttributes = (filter, idx, attributes, isMultiSelect) => {
    const searchQuery = searchQueries[idx] || '';

    const filteredAttributes = attributes.filter(attr =>
      attr.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const dropdownPosition =
      dropdownRefs.current[idx]?.getBoundingClientRect().bottom + 250 > window.innerHeight
        ? 'bottom-full mb-1'
        : 'top-full mt-1';

    // Multi-select and special "Issue Types" case
    if (isMultiSelect || filter.filterBy === 'Issue Types') {
      const selectedNames = attributes.flatMap(attr => {
        if (attr.subtypes) {
          return attr.subtypes.filter(sub => filter.attribute?.includes(sub.id))
            .map(sub => ({ id: sub.id, name: sub.name }));
        }
        return filter.attribute?.includes(attr.id)
          ? [{ id: attr.id, name: attr.name }]
          : [];
      });

      return (
        <>
          {/* Dropdown Trigger */}
          <div
            onClick={() =>
              setOpenDropdownIdx(openDropdownIdx === idx ? null : idx)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md cursor-pointer bg-white flex gap-1 flex-nowrap overflow-x-auto"
            style={{ scrollbarWidth: 'thin' }}
          >
            {selectedNames.length > 0 ? (
              <div className="flex gap-1">
                {selectedNames.map(attr => (
                  <span
                    key={attr.id}
                    className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs whitespace-nowrap flex items-center gap-1"
                  >
                    {attr.name}
                    <button
                      type="button"
                      onClick={e => {
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

          {/* Dropdown Content */}
          {openDropdownIdx === idx && (
            <div
              className={`absolute z-10 w-full max-h-52 overflow-y-auto border border-gray-300 rounded-md bg-white shadow ${dropdownPosition}`}
              ref={el => (dropdownRefs.current[idx] = el)}
            >
              {/* Sticky Search Box */}
              <div className="sticky top-0 z-10 bg-white p-2 border-b border-gray-200">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={e =>
                    setSearchQueries(prev => ({ ...prev, [idx]: e.target.value }))
                  }
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Filtered Options */}
              {filteredAttributes.length > 0 ? (
                filteredAttributes.map(attr => (
                  <div key={attr.id}>
                    {attr.subtypes ? (
                      <div>
                        <div className="px-3 py-2 text-xs font-semibold bg-gray-100 text-gray-600 uppercase cursor-default">
                          {attr.name}
                        </div>
                        {attr.subtypes
                          .filter(sub => sub.name.toLowerCase().includes(searchQuery.toLowerCase()))
                          .map(sub => {
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
                    ) : (
                      <button
                        type="button"
                        onClick={() => toggleAttribute(idx, attr.id)}
                        className={`flex items-center justify-between w-full px-3 py-2 text-left hover:bg-gray-50 ${
                          filter.attribute?.includes(attr.id) ? 'bg-blue-50' : ''
                        }`}
                      >
                        <span
                          className={`text-sm ${
                            filter.attribute?.includes(attr.id)
                              ? 'text-blue-700 font-medium'
                              : 'text-gray-700'
                          }`}
                        >
                          {attr.name}
                        </span>
                        <input
                          type="checkbox"
                          checked={filter.attribute?.includes(attr.id)}
                          readOnly
                          className="form-checkbox text-blue-600 pointer-events-none"
                        />
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="px-3 py-2 text-gray-400 text-sm">No results found</div>
              )}
            </div>
          )}
        </>
      );
    }

    // Single select fallback
    return (
      <select
        value={filter.attribute || ''}
        onChange={e =>
          handleFilterChange(idx, 'attribute', e.target.value)
        }
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
      >
        <option value="" disabled>
          Select an option
        </option>
        {attributes.map(attr =>
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
    );
  };

  const toggleAttribute = (filterIdx, attrId) => {
    const currentAttributes = Array.isArray(filters[filterIdx].attribute)
      ? filters[filterIdx].attribute
      : [];
    const updatedAttributes = currentAttributes.includes(attrId)
      ? currentAttributes.filter(id => id !== attrId)
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
          .map(f => f.filterBy);

        const isMandatory = filter.isMandatory;

        const availableOptions = filterOptions.filter(
          option =>
            !selectedFilterBys.includes(option) || option === filter.filterBy
        );

        let attributes = moduleFilters[filter.filterBy] || [];
        let isMultiSelect = !singleSelectFilters.includes(filter.filterBy);

        return (
          <div
            className="flex items-start space-x-3 mb-4 relative"
            key={idx}
            ref={el => (dropdownRefs.current[idx] = el)}
          >
            {/* Filter By Dropdown */}
            <div className="flex-1 max-w-[30%]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by
              </label>
              <select
                value={filter.filterBy}
                onChange={e => {
                  if (isMandatory) return;
                  handleFilterChange(idx, 'filterBy', e.target.value);
                  handleFilterChange(
                    idx,
                    'attribute',
                    singleSelectFilters.includes(e.target.value) ? '' : []
                  );
                }}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none ${
                  isMandatory ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                disabled={isMandatory}
              >
                {availableOptions.map(option => (
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
              {renderAttributes(filter, idx, attributes, isMultiSelect)}
            </div>

            {/* Delete Filter Button */}
            {!isMandatory && (
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
