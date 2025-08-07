// server.js
require('dotenv').config(); // Make sure env is loaded
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const fileUpload = require('express-fileupload');
const path = require('path');


const app = express();

const corsOptions = {
  origin: "https://tbpts1.myshopify.com", // your store frontend
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));            // ✅ CORRECT USAGE
app.options('*', cors(corsOptions));   // ✅ CORS Preflight handler

app.use(express.json());
app.use(fileUpload());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 3000;

// Replace with your Shopify credentials
const SHOPIFY_ADMIN_ACCESS_TOKEN = process.env.SHOPIFY_API_ACCESS_TOKEN; // Admin API access token
const SHOPIFY_STORE = "tbpts1.myshopify.com"; // Your store domain

app.use(express.json());

app.post('/api/upload-prescription', async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const uploadedFile = req.files.file;
    const filename = `${Date.now()}-${uploadedFile.name.replace(/\s+/g, '-')}`;
    const uploadPath = path.join(__dirname, 'uploads', filename);

    // Move file to /uploads
    await uploadedFile.mv(uploadPath);

    // Generate public URL
    const publicUrl = `${req.protocol}://${req.get('host')}/uploads/${filename}`;

    res.status(200).json({ success: true, url: publicUrl });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'File upload failed' });
  }
});

app.post("/api/create-draft-order", async (req, res) => {

    try {
        const {
            lensType,
            coating,
            tintColor,
            extraCoating,
            readingPower,
            extraPrice,
            lensOption,
            prismCorrection,
            prismOD,
            prismOS,
            prismBase,
            odSPH,
            odCYL,
            odAXIS,
            osSPH,
            osCYL,
            osAXIS,
            odADD,
            osADD,
            pd,
            pdRight,
            pdLeft,
            prescriptionType,
            entryMethod,
            prescriptionFile,
            productTitle
        } = req.body;

        console.log("hit1", req.body)
        const totalPrice = (Number(extraPrice || 0)).toFixed(2).toString();

        const draftOrderPayload = {
            draft_order: {
                line_items: [
                    {
                        title: productTitle,
                        custom: true,
                        quantity: 1,
                        price: totalPrice,
                        taxable: false,
                        properties: [
                            { name: "Lens Type", value: lensType },
                            { name: "Lens Option", value: lensOption },
                            { name: "Coating", value: coating },
                            { name: "Tint Color", value: tintColor },
                            { name: "Extra Coating", value: extraCoating },
                            { name: "Reading Power", value: readingPower },
                            { name: "Prism Correction", value: prismCorrection },
                            { name: "OD SPH", value: odSPH },
                            { name: "OD CYL", value: odCYL },
                            { name: "OD AXIS", value: odAXIS },
                            { name: "OS SPH", value: osSPH },
                            { name: "OS CYL", value: osCYL },
                            { name: "OS AXIS", value: osAXIS },
                            { name: "OD ADD", value: odADD },
                            { name: "OS ADD", value: osADD },
                            { name: "PD", value: pd },
                            { name: "PD Right", value: pdRight },
                            { name: "PD Left", value: pdLeft },
                            { name: "Prescription Type", value: prescriptionType },
                            { name: "Prescription File", value: prescriptionFile || "No file uploaded" },
                            { name: "Entry Method", value: entryMethod },
                            { name: "Total Price", value: totalPrice },
                            ...(prismCorrection === "Yes"
                                ? [
                                    { name: "Prism OD", value: prismOD },
                                    { name: "Prism OS", value: prismOS },
                                    { name: "Base Direction", value: prismBase },
                                ]
                                : [])
                        ]
                    },
                ],
            },
        };

        const response = await axios.post(
            `https://${SHOPIFY_STORE}/admin/api/2024-04/draft_orders.json`,
            draftOrderPayload,
            {
                headers: {
                    "X-Shopify-Access-Token": SHOPIFY_ADMIN_ACCESS_TOKEN,
                    "Content-Type": "application/json",
                },
            }
        );

        const invoiceUrl = response.data.draft_order.invoice_url;

        return res.status(200).json({
            success: true,
            draftOrderUrl: invoiceUrl,
        });
    } catch (error) {
        console.error("Error creating draft order:", error.response?.data || error.message);
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});