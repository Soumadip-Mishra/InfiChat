
const HighlightText = ({ text, match }) => {
  if (!text) return null;

  const words = text.split(/\s+/);

  return (
    <span>
      {words.map((word, idx) => {
        const isMatch = match && word.toLowerCase().startsWith(match.toLowerCase());

        return (
          <span key={idx} className={isMatch ? "bg-primary text-primary-content" : ""}>
            {word}
            {idx < words.length - 1 ? " " : ""}
          </span>
        );
      })}
    </span>
  );
};

export default HighlightText;
