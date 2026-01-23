import { Accordion, AccordionContent, AccordionHeader, AccordionItem } from "./Accordion";

// ✅ HELPER: Safely finds the section data (checking "Skills", "skills", etc.)
const getSectionData = (data: any, key: string) => {
    if (!data) return null;
    return data[key] || data[key.toLowerCase()] || data[key.charAt(0).toUpperCase() + key.slice(1)];
};

const Details = ({ feedback }: { feedback: any }) => {
    // Safety check
    if (!feedback) return <div className="text-gray-500 text-sm">Loading analysis details...</div>;

    // Map the IDs to the data using the safe extractor
    const categories = [
        { id: "tone", title: "Tone & Style", data: getSectionData(feedback, "toneAndStyle") },
        { id: "content", title: "Content", data: getSectionData(feedback, "content") },
        { id: "structure", title: "Structure", data: getSectionData(feedback, "structure") },
        { id: "skills", title: "Skills", data: getSectionData(feedback, "skills") },
    ];

    return (
        <Accordion className="w-full">
            {categories.map((cat) => (
                <AccordionItem id={cat.id} key={cat.id}>
                    <AccordionHeader itemId={cat.id}>
                        <div className="flex justify-between w-full pr-4">
                            <span className="font-bold text-slate-700">{cat.title}</span>
                            <span className={`font-black ${
                                (cat.data?.score || 0) >= 80 ? 'text-emerald-500' :
                                    (cat.data?.score || 0) >= 50 ? 'text-yellow-500' : 'text-red-500'
                            }`}>
                                {cat.data?.score ?? 0}/100
                            </span>
                        </div>
                    </AccordionHeader>
                    <AccordionContent itemId={cat.id}>
                        <div className="space-y-3 pt-2">
                            {/* Check if tips exist and is an array */}
                            {cat.data?.tips && Array.isArray(cat.data.tips) && cat.data.tips.length > 0 ? (
                                cat.data.tips.map((tip: any, i: number) => (
                                    <div key={i} className={`p-3 rounded-lg border border-l-4 ${
                                        tip.type === 'good'
                                            ? 'bg-emerald-50 border-emerald-200 border-l-emerald-500'
                                            : 'bg-amber-50 border-amber-200 border-l-amber-500'
                                    }`}>
                                        <p className="text-sm font-bold text-slate-800 mb-1">{tip.tip}</p>
                                        {tip.explanation && (
                                            <p className="text-xs text-slate-600">{tip.explanation}</p>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-slate-400 italic text-center py-2">
                                    No specific tips available for this section.
                                </p>
                            )}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    );
};

export default Details;