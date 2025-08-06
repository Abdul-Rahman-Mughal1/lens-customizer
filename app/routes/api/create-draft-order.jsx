// app/routes/api/create-draft-order.jsx
// import { authenticate } from "~/shopify.server";

export async function action({ request }) {
  try {
    const body = await request.json();

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
    } = body;

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
                : []),
            ],
          },
        ],
      },
    };

    const response = await fetch(`https://${process.env.SHOPIFY_STORE}/admin/api/2024-04/draft_orders.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": process.env.SHOPIFY_ADMIN_ACCESS_TOKEN,
      },
      body: JSON.stringify(draftOrderPayload),
    });

    const result = await response.json();
    const invoiceUrl = result.draft_order?.invoice_url;

    return new Response(JSON.stringify({ success: true, draftOrderUrl: invoiceUrl }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Draft order error:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}