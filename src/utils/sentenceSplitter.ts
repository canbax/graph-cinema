/**
 * Splits a text into sentences using Intl.Segmenter with enhancements for:
 * - Handling citations like [1], [12] to keep them attached to the previous sentence.
 * - Handling common abbreviations (U.S., Dr., etc.) to prevent incorrect splits.
 */
export function splitSentences(text: string): string[] {
    if (!text || !text.trim()) {
        return [];
    }

    // 1. Masking Strategy
    // We replace problematic patterns with temporary placeholders to "hide" them from Intl.Segmenter.

    const placeholders = new Map<string, string>();
    let placeholderCounter = 0;

    const createPlaceholder = (original: string) => {
        const key = `__PH_${placeholderCounter++}__`;
        placeholders.set(key, original);
        return key;
    };

    let processedText = text;

    // --- Masking Abbreviations ---
    // A list of common abbreviations that end with a dot but shouldn't end a sentence.
    // This list can be expanded or moved to a configuration file if needed.
    const abbreviations = [
        "Mr.", "Mrs.", "Ms.", "Dr.", "Prof.", "Sr.", "Jr.", "St.", "Mt.",
        "U.S.", "U.K.", "U.N.", "E.U.", "U.S.A.", "a.m.", "p.m.", "vs.", "etc.",
        "e.g.", "i.e.", "Inc.", "Ltd.", "Co.", "Corp."
    ];

    abbreviations.forEach(abbr => {
        // Escape dot for regex
        const escaped = abbr.replace(/\./g, '\\.');
        // Match word boundary to avoid partial matches (though most start with capital or specific chars)
        // For 'U.S.' we want to match it.
        // We use a regex that matches the abbreviation.
        const regex = new RegExp(`\\b${escaped}`, 'g');
        processedText = processedText.replace(regex, (match) => createPlaceholder(match));
    });

    // --- Handling Citations ---
    // Citations often appear as [1], [12] etc.
    // If they appear AFTER a period like "sentence.[1]", Intl.Segmenter might split after the period,
    // leaving "[1]" as a start of next sentence or alone.
    // We want "sentence.[1]" to be kept together.

    // Strategy: Swap punctuation and citation? Or just Link them?
    // Actually, if we mask the citation, Intl.Segmenter might still split at the period before it.
    // "End of sentence.[1]" -> Segmenter sees "End of sentence." and "[1]"
    // If we change ".[1]" to "[1]." then Segmenter sees "End of sentence[1]." which works better.
    // But we need to reverse this later.

    // Let's protect citations first by masking them.
    // But simply masking [1] doesn't stop split at '.' in "text.[1] Next".
    // We need to attach [1] to the previous word.

    // Improved Strategy for Citations:
    // 1. Identify ".[1]", "?[2]", "![3]" patterns.
    // 2. Temporarily replace them with a unique token that has NO punctuation.
    //    e.g. ".__CITATION_1__" -> " __CITATION_PLACEHOLDER_1__ " (no dot)
    //    Wait, if we remove the dot, Intl.Segmenter won't split there!
    //    "End of sentence __CITATION__ Next sentence" -> likely one sentence.
    //    This is NOT what we want. We WANT a split, but AFTER the citation.

    // Correct Strategy:
    // Move the punctuation AFTER the citation.
    // "phrase.[1]" -> "phrase[1]."
    // Then Intl.Segmenter splits after ".".
    // Finally we restore "phrase[1]." -> "phrase.[1]"

    // Step 1: Find citations [digits]
    // We also need to handle cases where citation is already after period?
    // Usually standard is "sentence.[1]" or "sentence[1]."
    // If it is "sentence[1].", Segmenter handles it fine.
    // If it is "sentence.[1]", Segmenter splits at dot.

    // We will look for Punctuation + Citation pattern and SWAP them.
    // Punctuation: . ! ?
    // Citation: \[(\d+)\]

    // Regex: /([.!?])\s*(\[\d+\])/g
    // We replace with "$2$1" (Citation + Punctuation)
    // We need to remember where we did this to swap back?
    // Or we can just blindly swap back if the text allows?
    // "text[1]." -> "text.[1]" ??? Maybe risky if original text was like that.
    // But the user's example has "activities ... celebrities.[3]" -> we want "celebrities.[3]" to be ONE sentence end.

    // Let's try SWAPPING mechanism.
    // processedText is currently masked of abbreviations.

    // Swap ".[1]" to "[1]."
    // We use a marker to know we swapped it?
    // Let's use a specific placeholder for the SWAPPED sequence.
    // ".[12]" -> "__SWAPPED_CITATION_12__" where "__SWAPPED_CITATION_12__" maps to ".[12]"
    // AND we append a dummy period to it so Segmenter splits?
    // "__SWAPPED_CITATION_12__" + "."
    // When unmasking, we replace "__SWAPPED_CITATION_12__." with ".[12]"

    const swappedCitations = new Map<string, string>();
    let swapCounter = 0;

    processedText = processedText.replace(/([.!?])\s*(\[\d+\])/g, (match) => {
        // match is ".[3]" or "?[3]"
        // We want to force a split AFTER this whole block, but treat it as one unit.
        // If we replace ".[3]" with a placeholder "PH", Segmenter sees "word PH Next".
        // Use a placeholder that ends with a period!
        // "PH."
        const token = `__CIT_${swapCounter++}__`;
        // punct+cite is the original ".[3]"
        // We map token -> ".[3]" (the original match)
        swappedCitations.set(token, match);
        // We return token + punct. Wait, if we return "PH.", the split happens at dot.
        // Then we get "word PH." as a segment.
        return token + ".";
    });

    // Also mask isolated citations that might be confused?
    // "[3]" -> placeholder.
    processedText = processedText.replace(/\[\d+\]/g, (match) => createPlaceholder(match));


    // 2. Segmentation
    const segmenter = new Intl.Segmenter('en', { granularity: 'sentence' });
    const segments = Array.from(segmenter.segment(processedText));

    // 3. Unmasking & Validation
    const results = segments.map(seg => {
        let sentence = seg.segment.trim();

        if (!sentence) return null;

        // Restore swapped citations first
        // We added a dot "." to the token "___CIT_0__".
        // So the sentence might look like "This is text ___CIT_0__."
        // We need to replace "___CIT_0__." with the original ".[3]"
        // Regex for our token
        sentence = sentence.replace(/__CIT_\d+__\./g, (match) => {
            // match is "__CIT_0__."
            const token = match.slice(0, -1); // remove dot
            return swappedCitations.get(token) || match;
        });

        // Restore generic placeholders (abbreviations, other citations)
        sentence = sentence.replace(/__PH_\d+__/g, (match) => placeholders.get(match) || match);

        return sentence.trim();
    }).filter(s => s !== null && s.length > 0) as string[];

    return results;
}
