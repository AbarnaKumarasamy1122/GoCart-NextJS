import imagekit from "@/configs/imageKit";
import prisma from "@/lib/prisma";
import { clerkClient, getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// create the store
export async function POST(request) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the data from the form
    const formData = await request.formData();

    const name = formData.get("name");
    const username = formData.get("username");
    const description = formData.get("description");
    const email = formData.get("email");
    const contact = formData.get("contact");
    const address = formData.get("address");
    const image = formData.get("image");

    const trimmedData = {
      name: (name || "").toString().trim(),
      username: (username || "").toString().trim(),
      description: (description || "").toString().trim(),
      email: (email || "").toString().trim(),
      contact: (contact || "").toString().trim(),
      address: (address || "").toString().trim(),
    };

    const missingFields = Object.entries(trimmedData)
      .filter(([, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 },
      );
    }

    if (!image || typeof image.arrayBuffer !== "function") {
      return NextResponse.json(
        { error: "Store logo image is required" },
        { status: 400 },
      );
    }

    // Ensure user exists in local database in case Inngest sync is delayed/not running.
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);
    await prisma.user.upsert({
      where: { id: userId },
      update: {
        email: clerkUser.emailAddresses?.[0]?.emailAddress || "",
        name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim(),
        image: clerkUser.imageUrl || "",
      },
      create: {
        id: userId,
        email: clerkUser.emailAddresses?.[0]?.emailAddress || "",
        name:
          `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
          "User",
        image: clerkUser.imageUrl || "",
      },
    });

    const normalizedUsername = trimmedData.username.toLowerCase();

    // Ensure no other user/store has this username.
    if (normalizedUsername.length < 3) {
      return NextResponse.json(
        { error: "Username must be at least 3 characters" },
        { status: 400 },
      );
    }

    // check is user have already registered a store
    const store = await prisma.store.findFirst({
      where: {
        userId: userId,
      },
    });

    // if store is already registered then send status of store
    if (store) {
      return NextResponse.json({ status: store.status });
    }

    // check is username is already taken
    const isUsernameTaken = await prisma.store.findFirst({
      where: {
        username: normalizedUsername,
      },
    });

    if (isUsernameTaken) {
      return NextResponse.json(
        { error: "Username is already taken" },
        { status: 400 },
      );
    }

    // image upload to imagekit
    const buffer = Buffer.from(await image.arrayBuffer());
    const response = await imagekit.upload({
      file: buffer,
      fileName: image.name,
      folder: "logos",
    });

    const optimizedImage = imagekit.url({
      path: response.filePath,
      transformation: [
        { quality: "auto" },
        { format: "webp" },
        { width: "512" },
      ],
    });

    const newStore = await prisma.store.create({
      data: {
        userId,
        name: trimmedData.name,
        description: trimmedData.description,
        username: normalizedUsername,
        email: trimmedData.email,
        contact: trimmedData.contact,
        address: trimmedData.address,
        logo: optimizedImage,
      },
    });

    return NextResponse.json({ message: "Applied, please wait for approval" });
  } catch (error) {
    console.error("Error creating store:", error);
    return NextResponse.json(
      { error: error.code || error.message },
      { status: 400 },
    );
  }
}

// check is user have already registered a store if yes then return the status of the store
export async function GET(request) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // check is user have already registered a store
    const store = await prisma.store.findFirst({
      where: {
        userId: userId,
      },
    });

    // if store is already registered then send status of store
    if (store) {
      return NextResponse.json({ status: store.status });
    }
    return NextResponse.json({ status: "Not registered" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error.code || error.message },
      { status: 400 },
    );
  }
}
