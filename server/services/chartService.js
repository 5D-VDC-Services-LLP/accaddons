// services/chartService.js
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const axios = require('axios');
const FormData = require('form-data');

const width = 800; // px
const height = 600; // px
const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

async function generateChartBuffer(data) {
    const configuration = {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [{
                label: data.title,
                data: data.values,
                backgroundColor: data.colors || ['red', 'blue', 'yellow']
            }]
        }
    };

    return await chartJSNodeCanvas.renderToBuffer(configuration, 'image/jpeg');
}

async function uploadChartToWhatsApp(buffer, phoneNumberId, accessToken) {
    const form = new FormData();
    form.append('file', buffer, {
        filename: 'chart.jpg',
        contentType: 'image/jpeg'
    });
    form.append('type', 'image/jpeg');
    form.append('messaging_product', 'whatsapp');

    const response = await axios.post(
        `https://graph.facebook.com/v19.0/${phoneNumberId}/media`,
        form,
        {
            headers: {
                ...form.getHeaders(),
                'Authorization': `Bearer ${accessToken}`
            }
        }
    );

    return response.data; // returns media_id
}

module.exports = {
    generateChartBuffer,
    uploadChartToWhatsApp
};
