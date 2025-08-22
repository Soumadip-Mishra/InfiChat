import  { useEffect, useState } from "react";

const TypingComponent = () => {
	const arr = [".", "..", "..."]; 
	const [index, setIndex] = useState(0);

	useEffect(() => {
		const intervalID = setInterval(() => {
			setIndex(prev => (prev + 1) % 3);
		}, 500);

		return () => clearInterval(intervalID);
	}, []);

	return (
		<span className="text-primary overflow-hidden">
			is typing <span className="text-2xl ">{arr[index]}</span>
		</span>
	);
};

export default TypingComponent;
