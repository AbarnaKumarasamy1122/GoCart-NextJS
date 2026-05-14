import imagekit from "@/configs/imageKit";
import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
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

        if(!name || !username || !description || !email || !contact || !address || !image) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }

        // check is user have already registered a store
        const store = await prisma.store.findFirst({
            where: {
                userId: userId
            }
        });

        // if store is already registered then send status of store
        if(store) { 
            return NextResponse.json({ status: store.status });
        }

        // check is username is already taken
        const isUsernameTaken = await prisma.store.findFirst({
            where: {
                username: username.toLowerCase()
            }
        });

        if(isUsernameTaken) {
            return NextResponse.json({ error: "Username is already taken" }, { status: 400 });
        }

        // image upload to imagekit
        const buffer = Buffer.from(await image.arrayBuffer());
        const response = await imagekit.upload({
            file: buffer,
            fileName: image.name,
            folder: "logos"
        })

        const optimizedImage = imagekit.url({
            path: response.filePath,
            transformation: [
                {quality: 'auto'},
                {format: 'webp'},  
                {width: '512'}
            ]
        })

        const newStore = await prisma.store.create({
            data: {
                userId,
                name,
                description,
                username: username.toLowerCase(),
                email,  
                contact,
                address,
                logo: optimizedImage
            }
        });

        // link the store to the user
        await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                store: { connect: { id: newStore.id } }
            }   
        });

        return NextResponse.json({ message: "Applied, please wait for approval" });    

    } catch (error) {
        console.error("Error creating store:", error);
        return NextResponse.json({ error: error.code || error.message }, { status: 400 });
    }
}

// check is user have already registered a store if yes then return the status of the store
export async function GET(request){
    try {
        const { userId } = getAuth(request);

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // check is user have already registered a store
        const store = await prisma.store.findFirst({
            where: {
                userId: userId
            }
        });

        // if store is already registered then send status of store
        if(store) { 
            return NextResponse.json({ status: store.status });
        }
        return NextResponse.json({ status: "Not registered" });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.code || error.message }, { status: 400 });
    }
}