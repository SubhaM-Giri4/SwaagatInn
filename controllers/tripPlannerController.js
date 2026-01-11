function mockItinerary(destination, days, interests) {
    let text = `${days}-Day Travel Itinerary for ${destination}\n\n`;
    text += `This itinerary is thoughtfully planned to give you a balanced experience of sightseeing, local culture, relaxation, and exploration`;
    if (interests) text += `, with special attention to your interests in ${interests}`;
    text += `.\n\n`;

    for (let i = 1; i <= days; i++) {
        text += `Day ${i}: ${getDayTheme(i)}\n`;
        text += `Morning:\n`;
        text += `Start your day with a relaxed breakfast and visit popular attractions or scenic spots around ${destination}. This is the best time for photography and peaceful exploration.\n\n`;

        text += `Afternoon:\n`;
        text += `Enjoy authentic local cuisine at a recommended restaurant. After lunch, explore cultural landmarks such as museums, heritage sites, or local neighborhoods to understand the history and lifestyle of the place.\n\n`;

        text += `Evening:\n`;
        text += `Spend your evening exploring local markets, cafes, or waterfront areas. You can also enjoy leisure activities, shopping, or a calm sunset viewpoint.\n\n`;

        if (interests) {
            text += `Special Interest Activities:\n`;
            text += `Engage in activities related to ${interests}, curated to enhance your personal travel experience.\n\n`;
        }

        text += `Stay Recommendation:\n`;
        text += `Choose accommodation close to major attractions to reduce travel time and maximize comfort.\n\n`;
    }

    text += `General Travel Tips:\n`;
    text += `• Start early to avoid crowds and make the most of the day.\n`;
    text += `• Use local transport or guided walking tours for authentic experiences.\n`;
    text += `• Keep evenings flexible for spontaneous exploration.\n`;
    text += `• Stay hydrated and carry essentials while sightseeing.\n\n`;

    text += `This itinerary is designed to provide a smooth, enjoyable, and memorable travel experience while maintaining a relaxed pace.\n`;

    return text;
}

function getDayTheme(day) {
    const themes = [
        "Arrival and First Impressions",
        "Cultural and Heritage Exploration",
        "Nature and Scenic Beauty",
        "Local Life and Markets",
        "Leisure and City Exploration",
        "Adventure and Experiences",
        "Relaxation and Trip Wrap-Up"
    ];
    return themes[(day - 1) % themes.length];
}


let client = null;
if (process.env.USE_MOCK_AI !== "true") {
    const OpenAI = require("openai");
    client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    });
}

module.exports.showForm = (req, res) => {
    res.render("tripPlannerForm");
};

module.exports.generateItinerary = async (req, res) => {
    try {
        const { destination, days, interests } = req.body;
        let itinerary;

        if (process.env.USE_MOCK_AI === "true") {
            itinerary = mockItinerary(destination, days, interests);
        } else {
            const prompt = `
            Create a detailed ${days}-day itinerary for a trip to ${destination}.
            Include activities based on the following interests: ${interests}.
            Give day-wise schedule, places to visit, and approximate times.
            `;

            const response = await client.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: prompt }]
            });

            itinerary = response.choices[0].message.content;
        }

        res.render("tripPlannerResult", { itinerary, destination });

    } catch (err) {
        console.error("AI Error:", err);

        const fallback = mockItinerary(
            req.body.destination,
            req.body.days,
            req.body.interests
        );

        res.render("tripPlannerResult", {
            itinerary: fallback,
            destination: req.body.destination
        });
    }
};
