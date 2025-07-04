'use client'
import { productsDummyData, userDummyData } from "@/assets/assets";
import { useAuth, useSignUp, useUser } from "@clerk/nextjs";
import axios from "axios";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

export const AppContext = createContext();

export const useAppContext = () => {
    return useContext(AppContext)
}

export const AppContextProvider = (props) => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY
    const router = useRouter()

    const { user } = useUser()
    const { getToken } = useAuth()

    const [products, setProducts] = useState([])
    const [userData, setUserData] = useState(false)
    const [isSeller, setIsSeller] = useState(false)
    const [cartItems, setCartItems] = useState({})

    const fetchProductData = async () => {
        try {
            const { data } = await axios.get('/api/product/list')

            if (data.success) {
                setProducts(data.products)
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
        }
    }

    const fetchUserData = async () => {
        try {
            if (user.publicMetadata.role === 'seller') {
                setIsSeller(true)
            }

            const token = await getToken()
            const { data } = await axios.get('/api/user/data', { headers: { Authorization: `Bearer ${token}` } })
            if (data.success) {
                setUserData(data.user)
                setCartItems(data.user.cartItems)

            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)

        }
    }

    const addToCart = async (itemId) => {
        console.log("addToCart called with itemId:", itemId, "products:", products);
        if (!Array.isArray(products) || products.length === 0) {
            toast.error("Products not loaded yet!");
            return;
        }
        const itemInfo = products.find((product) => product._id === itemId);
        if (!itemInfo) {
            toast.error("Product not found!");
            return;
        }
        let cartData = structuredClone(cartItems || {});
        if (cartData[itemId]) {
            cartData[itemId] += 1;
        }
        else {
            cartData[itemId] = 1;
        }
        setCartItems(cartData);
        toast.success("Item added to cart")
    }

    const updateCartQuantity = async (itemId, quantity) => {

        let cartData = structuredClone(cartItems);
        if (quantity === 0) {
            delete cartData[itemId];
        } else {
            cartData[itemId] = quantity;
        }
        setCartItems(cartData)

    }

    const getCartCount = () => {
        let totalCount = 0;
        for (const items in cartItems) {
            if (cartItems[items] > 0) {
                totalCount += cartItems[items];
            }
        }
        return totalCount;
    }

    const getCartAmount = () => {
        let totalAmount = 0;
        for (const items in cartItems) {
            let itemInfo = products.find((product) => product._id === items);
            if (cartItems[items] > 0 && itemInfo) {
                totalAmount += itemInfo.offerPrice * cartItems[items];
            }
        }
        return Math.floor(totalAmount * 100) / 100;
    }

    useEffect(() => {
        fetchProductData()
    }, [])

    useEffect(() => {
        if (user) {
            fetchUserData()
        }
    }, [user])

    useEffect(() => {
        // Clean up cart items that don't exist in products
        const validProductIds = new Set(products.map(p => p._id));
        const cleanedCart = Object.fromEntries(
            Object.entries(cartItems).filter(([itemId]) => validProductIds.has(itemId))
        );
        if (Object.keys(cleanedCart).length !== Object.keys(cartItems).length) {
            setCartItems(cleanedCart);
        }
    }, [products]);

    const value = {
        user, getToken,
        currency, router,
        isSeller, setIsSeller,
        userData, fetchUserData,
        products, fetchProductData,
        cartItems, setCartItems,
        addToCart, updateCartQuantity,
        getCartCount, getCartAmount
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}