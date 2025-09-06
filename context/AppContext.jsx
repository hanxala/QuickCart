'use client'
import { productsDummyData, userDummyData } from "@/assets/assets";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from '@clerk/nextjs';
import toast from 'react-hot-toast';

export const AppContext = createContext();

export const useAppContext = () => {
    return useContext(AppContext)
}

export const AppContextProvider = (props) => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY
    const router = useRouter()
    const { userId, isSignedIn, getToken } = useAuth()

    const [products, setProducts] = useState([])
    const [userData, setUserData] = useState(false)
    const [cartItems, setCartItems] = useState({})
    const [loading, setLoading] = useState(false)

    const fetchProductData = async (category = '', search = '', page = 1, limit = 50) => {
        try {
            setLoading(true)
            const params = new URLSearchParams()
            if (category) params.append('category', category)
            if (search) params.append('search', search)
            params.append('page', page.toString())
            params.append('limit', limit.toString())
            
            const response = await fetch(`/api/products?${params}`)
            const data = await response.json()
            
            if (data.success) {
                setProducts(data.data.products)
            } else {
                console.error('Failed to fetch products:', data.error)
                // Fallback to dummy data if API fails
                setProducts(productsDummyData)
            }
        } catch (error) {
            console.error('Error fetching products:', error)
            // Fallback to dummy data on error
            setProducts(productsDummyData)
        } finally {
            setLoading(false)
        }
    }

    const fetchUserData = async () => {
        if (!isSignedIn) {
            setUserData(false)
            return
        }
        
        try {
            const token = await getToken()
            const response = await fetch('/api/users', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            
            const data = await response.json()
            
            if (data.success) {
                setUserData(data.data)
                setCartItems(data.data.cartItems || {})
            } else {
                console.error('Failed to fetch user data:', data.error)
                setUserData(userDummyData)
            }
        } catch (error) {
            console.error('Error fetching user data:', error)
            setUserData(userDummyData)
        }
    }

    const addToCart = async (itemId, quantity = 1) => {
        if (!isSignedIn) {
            toast.error('Please sign in to add items to cart')
            return false
        }
        
        try {
            const token = await getToken()
            const response = await fetch('/api/cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ productId: itemId, quantity })
            })
            
            const data = await response.json()
            
            if (data.success) {
                // Update local cart state
                let cartData = structuredClone(cartItems)
                if (cartData[itemId]) {
                    cartData[itemId] += quantity
                } else {
                    cartData[itemId] = quantity
                }
                setCartItems(cartData)
                toast.success('Item added to cart')
                return true
            } else {
                toast.error(data.error || 'Failed to add item to cart')
                return false
            }
        } catch (error) {
            console.error('Error adding to cart:', error)
            toast.error('Failed to add item to cart')
            return false
        }
    }

    const updateCartQuantity = async (itemId, quantity) => {
        if (!isSignedIn) {
            toast.error('Please sign in to update cart')
            return false
        }
        
        try {
            const token = await getToken()
            const response = await fetch('/api/cart', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ productId: itemId, quantity })
            })
            
            const data = await response.json()
            
            if (data.success) {
                // Update local cart state
                let cartData = structuredClone(cartItems)
                if (quantity === 0) {
                    delete cartData[itemId]
                } else {
                    cartData[itemId] = quantity
                }
                setCartItems(cartData)
                return true
            } else {
                toast.error(data.error || 'Failed to update cart')
                return false
            }
        } catch (error) {
            console.error('Error updating cart:', error)
            toast.error('Failed to update cart')
            return false
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
            if (cartItems[items] > 0 && itemInfo && itemInfo.offerPrice) {
                totalAmount += itemInfo.offerPrice * cartItems[items];
            }
        }
        return Math.floor(totalAmount * 100) / 100;
    }

    const cleanupInvalidCartItems = () => {
        if (!products.length) return;
        
        const validCartItems = {};
        let hasInvalidItems = false;
        
        for (const itemId in cartItems) {
            const product = products.find((product) => product._id === itemId);
            if (product && product.offerPrice && cartItems[itemId] > 0) {
                validCartItems[itemId] = cartItems[itemId];
            } else if (cartItems[itemId] > 0) {
                hasInvalidItems = true;
                console.warn(`Removing invalid cart item: ${itemId}`);
            }
        }
        
        if (hasInvalidItems) {
            setCartItems(validCartItems);
        }
    }

    useEffect(() => {
        fetchProductData()
    }, [])
    
    useEffect(() => {
        if (products.length > 0) {
            cleanupInvalidCartItems()
        }
    }, [products])

    useEffect(() => {
        if (isSignedIn) {
            fetchUserData()
        } else {
            setUserData(false)
            setCartItems({})
        }
    }, [isSignedIn, userId])

    const value = {
        currency, router,
        isSignedIn, userId,
        userData, fetchUserData,
        products, fetchProductData, loading,
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