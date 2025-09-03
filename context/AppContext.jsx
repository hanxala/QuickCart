'use client'
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import toast from "react-hot-toast";

export const AppContext = createContext();

export const useAppContext = () => {
    return useContext(AppContext)
}

export const AppContextProvider = (props) => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY
    const router = useRouter()

    const [products, setProducts] = useState([])
    const [userData, setUserData] = useState(false)
    const [isSeller, setIsSeller] = useState(false)
    const [isAdmin, setIsAdmin] = useState(false)
    const [cartItems, setCartItems] = useState({})
    const [loading, setLoading] = useState(false)
    const { isLoaded, isSignedIn, userId } = useAuth()
    const { user } = useUser()
    
    // Admin email from environment variables
    const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'your-email@example.com'

    const fetchProductData = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/products')
            const data = await response.json()
            if (data.success) {
                setProducts(data.products)
            }
        } catch (error) {
            console.error('Error fetching products:', error)
            toast.error('Failed to load products')
        } finally {
            setLoading(false)
        }
    }

    const fetchUserData = async () => {
        if (!isSignedIn || !userId) return
        
        try {
            setLoading(true)
            const response = await fetch(`/api/users/${userId}`)
            const data = await response.json()
            if (data.success) {
                setUserData(data.user)
                setIsSeller(data.user?.isSeller || false)
                
                // Check if user is admin based on email
                if (user?.primaryEmailAddress?.emailAddress === ADMIN_EMAIL) {
                    setIsAdmin(true)
                }
            }
        } catch (error) {
            console.error('Error fetching user data:', error)
            toast.error('Failed to load user data')
        } finally {
            setLoading(false)
        }
    }

    const addToCart = async (itemId) => {
        try {
            let cartData = structuredClone(cartItems);
            if (cartData[itemId]) {
                cartData[itemId] += 1;
            }
            else {
                cartData[itemId] = 1;
            }
            setCartItems(cartData);
            
            // Save cart to localStorage
            localStorage.setItem('cartItems', JSON.stringify(cartData));
            toast.success('Added to cart');
        } catch (error) {
            console.error('Error adding to cart:', error);
            toast.error('Failed to add to cart');
        }
    }

    const updateCartQuantity = async (itemId, quantity) => {
        try {
            let cartData = structuredClone(cartItems);
            if (quantity === 0) {
                delete cartData[itemId];
                toast.success('Item removed from cart');
            } else {
                cartData[itemId] = quantity;
                toast.success('Cart updated');
            }
            setCartItems(cartData);
            
            // Save cart to localStorage
            localStorage.setItem('cartItems', JSON.stringify(cartData));
        } catch (error) {
            console.error('Error updating cart:', error);
            toast.error('Failed to update cart');
        }
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
            if (cartItems[items] > 0) {
                totalAmount += itemInfo.offerPrice * cartItems[items];
            }
        }
        return Math.floor(totalAmount * 100) / 100;
    }

    // Load cart from localStorage on initial load
    useEffect(() => {
        const savedCart = localStorage.getItem('cartItems');
        if (savedCart) {
            try {
                setCartItems(JSON.parse(savedCart));
            } catch (error) {
                console.error('Error parsing saved cart:', error);
                localStorage.removeItem('cartItems');
            }
        }
    }, []);

    useEffect(() => {
        fetchProductData()
    }, [])

    useEffect(() => {
        if (isLoaded && isSignedIn) {
            fetchUserData()
        }
    }, [isLoaded, isSignedIn, userId])

    const value = {
        currency, router,
        isSeller, setIsSeller,
        isAdmin, setIsAdmin,
        userData, fetchUserData,
        products, fetchProductData,
        cartItems, setCartItems,
        addToCart, updateCartQuantity,
        getCartCount, getCartAmount,
        loading, isSignedIn, userId, user
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}