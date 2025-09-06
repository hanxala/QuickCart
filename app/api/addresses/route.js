import dbConnect from '@/lib/database';
import Address from '@/models/Address';
import { NextResponse } from 'next/server';
import { authMiddleware, createApiResponse, handleApiError } from '@/middleware/auth';

// GET - Fetch user's addresses
export async function GET(request) {
  try {
    await dbConnect();
    
    const auth = await authMiddleware(request);
    if (auth.error) {
      const response = createApiResponse(auth.error, auth.status);
      return NextResponse.json(response, { status: auth.status });
    }

    const addresses = await Address.find({ userId: auth.userId }).sort({ isDefault: -1, createdAt: -1 });

    const response = createApiResponse(addresses);
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    const errorResponse = handleApiError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.status });
  }
}

// POST - Create new address
export async function POST(request) {
  try {
    await dbConnect();
    
    const auth = await authMiddleware(request);
    if (auth.error) {
      const response = createApiResponse(auth.error, auth.status);
      return NextResponse.json(response, { status: auth.status });
    }

    const body = await request.json();
    const { fullName, phoneNumber, area, city, state, pincode, addressType, isDefault } = body;

    // Validation
    if (!fullName || !phoneNumber || !area || !city || !state || !pincode) {
      const response = createApiResponse('All required fields must be provided', 400);
      return NextResponse.json(response, { status: 400 });
    }

    // If this is set as default, remove default from other addresses
    if (isDefault) {
      await Address.updateMany(
        { userId: auth.userId, isDefault: true },
        { isDefault: false }
      );
    }

    const address = new Address({
      userId: auth.userId,
      fullName,
      phoneNumber,
      area,
      city,
      state,
      pincode: parseInt(pincode),
      addressType: addressType || 'home',
      isDefault: isDefault || false
    });

    await address.save();

    const response = createApiResponse(address, 201);
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    const errorResponse = handleApiError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.status });
  }
}

// PUT - Update address
export async function PUT(request) {
  try {
    await dbConnect();
    
    const auth = await authMiddleware(request);
    if (auth.error) {
      const response = createApiResponse(auth.error, auth.status);
      return NextResponse.json(response, { status: auth.status });
    }

    const body = await request.json();
    const { addressId, ...updateData } = body;

    if (!addressId) {
      const response = createApiResponse('Address ID is required', 400);
      return NextResponse.json(response, { status: 400 });
    }

    const address = await Address.findOne({ _id: addressId, userId: auth.userId });
    if (!address) {
      const response = createApiResponse('Address not found', 404);
      return NextResponse.json(response, { status: 404 });
    }

    // If updating to default, remove default from other addresses
    if (updateData.isDefault) {
      await Address.updateMany(
        { userId: auth.userId, isDefault: true, _id: { $ne: addressId } },
        { isDefault: false }
      );
    }

    const updatedAddress = await Address.findByIdAndUpdate(addressId, updateData, { new: true });

    const response = createApiResponse(updatedAddress);
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    const errorResponse = handleApiError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.status });
  }
}

// DELETE - Delete address
export async function DELETE(request) {
  try {
    await dbConnect();
    
    const auth = await authMiddleware(request);
    if (auth.error) {
      const response = createApiResponse(auth.error, auth.status);
      return NextResponse.json(response, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const addressId = searchParams.get('id');

    if (!addressId) {
      const response = createApiResponse('Address ID is required', 400);
      return NextResponse.json(response, { status: 400 });
    }

    const address = await Address.findOne({ _id: addressId, userId: auth.userId });
    if (!address) {
      const response = createApiResponse('Address not found', 404);
      return NextResponse.json(response, { status: 404 });
    }

    await Address.findByIdAndDelete(addressId);

    // If deleted address was default, make another address default (if any exists)
    if (address.isDefault) {
      const nextAddress = await Address.findOne({ userId: auth.userId });
      if (nextAddress) {
        nextAddress.isDefault = true;
        await nextAddress.save();
      }
    }

    const response = createApiResponse('Address deleted successfully');
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    const errorResponse = handleApiError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.status });
  }
}
