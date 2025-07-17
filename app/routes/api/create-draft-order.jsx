import { authenticate } from "~/shopify.server";

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  try {
    const formData = await request.json();

    const {
      lensType,
      lensOption,
      coating,
      tintColor,
      extraCoating,
      "Add Reading Power": readingPower,
      "extra-price": extraPrice,
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
      JSON.stringify({ success: true, draftOrderUrl: response.body.draft_order.invoice_url }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Draft Order Error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
};
