interface BookQuoteProps {
  quote: string
  author: string
  book: string
  year: number
  page?: number
  context: string
  affiliateLink?: string
}

export function BookQuote({ quote, author, book, year, page, context, affiliateLink }: BookQuoteProps) {
  return (
    <div className="border-l-4 border-primary p-4 bg-gray-50 rounded-r-lg my-4">
      <blockquote className="italic text-gray-700 mb-3 text-lg">
        "{quote}"
      </blockquote>
      <cite className="text-sm text-gray-600 font-medium">
        - {author}, <em>{book}</em> ({year}){page && `, p. ${page}`}
      </cite>
      <p className="mt-3 text-sm text-gray-800 leading-relaxed">{context}</p>
      {affiliateLink && (
        <a 
          href={affiliateLink} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center mt-3 text-xs text-primary hover:text-primary/80"
        >
          📚 Read the full book
        </a>
      )}
    </div>
  )
}
