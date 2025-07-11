// controllers/whatsappController.js
const chartService = require('../services/chartService');

async function sendChartToUser(req, res) {
    const { user, chartData } = req.body;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

    try {
        // Generate chart buffer
        const buffer = await chartService.generateChartBuffer(chartData);

        // Upload chart to WhatsApp
        const mediaResponse = await chartService.uploadChartToWhatsApp(buffer, phoneNumberId, accessToken);

        return res.status(200).json({
            status: 'success',
            mediaId: mediaResponse.id,
            message: 'Chart sent to WhatsApp'
        });
    } catch (error) {
        console.error("Error sending chart:", error);
        return res.status(500).json({ error: 'Failed to send chart' });
    }
}

module.exports = {
    sendChartToUser
};
