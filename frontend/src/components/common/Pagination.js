"use client"

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pageNumbers = []

  // Generate page numbers
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i)
  }

  return (
    <ul className="pagination">
      <li className="pagination-item">
        <button
          className={`pagination-link ${currentPage === 1 ? "disabled" : ""}`}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          &laquo;
        </button>
      </li>
      {pageNumbers.map((number) => (
        <li key={number} className="pagination-item">
          <button
            className={`pagination-link ${currentPage === number ? "active" : ""}`}
            onClick={() => onPageChange(number)}
          >
            {number}
          </button>
        </li>
      ))}
      <li className="pagination-item">
        <button
          className={`pagination-link ${currentPage === totalPages ? "disabled" : ""}`}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          &raquo;
        </button>
      </li>
    </ul>
  )
}

export default Pagination

