// app/routes/api/create-draft-order.jsx
import { authenticate } from "~/shopify.server";

export async function action({ request }) {
  // ✅ Handle preflight OPTIONS
  if (request.method === "OPTIONS") {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

  try {
    const { admin } = await authenticate.admin(request);
    const formData = await request.json();

    const {
      lensType,
      coating,
      tintColor,
      extraCoating,
      readingPower,
      extraPrice,
      lensOption,
    } = formData;

    const draftOrderPayload = {
      draft_order: {
        line_items: [
          {
            title: `Custom Lenses: ${lensType || ""} - ${lensOption || ""}`,
            price: Number(extraPrice || 0),
            quantity: 1,
            properties: [
              { name: "Lens Type", value: lensType },
              { name: "Lens Option", value: lensOption },
              { name: "Coating", value: coating },
              { name: "Tint Color", value: tintColor },
              { name: "Extra Coating", value: extraCoating },
              { name: "Reading Power", value: readingPower },
            ],
          },
        ],
      },
    };

    const response = await admin.rest.post({
      path: "draft_orders",
      data: draftOrderPayload,
      type: "application/json",
    });

    return new Response(
      JSON.stringify({
        success: true,
        draftOrderUrl: response.body.draft_order.invoice_url,
      }),
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("API error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json",
      },
    });
  }
}
