"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

interface CheckoutButtonProps {
    amount: number;
    courseId: string;
    userId: string;
    customerDetails: {
        first_name: string;
        email: string;
    };
    itemDetails: {
        id: string;
        price: number;
        quantity: number;
        name: string;
    }[];
}

export const CheckoutButton = ({
    amount,
    courseId,
    userId,
    customerDetails,
    itemDetails
}: CheckoutButtonProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const onCheckout = async () => {
        try {
            setIsLoading(true);
            const response = await fetch("/api/midtrans", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    amount,
                    courseId,
                    userId,
                    customerDetails,
                    itemDetails
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Something went wrong");
            }

            if (data.token) {
                // @ts-ignore
                window.snap.pay(data.token, {
                    onSuccess: function (result: any) {
                        toast.success("Payment successful!");
                        router.refresh();
                        window.location.reload();
                    },
                    onPending: function (result: any) {
                        toast("Waiting for payment...");
                        router.refresh();
                    },
                    onError: function (result: any) {
                        toast.error("Payment failed!");
                    },
                    onClose: function () {
                        toast.error("You closed the popup without finishing the payment");
                    }
                });
            }

        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <button
            onClick={onCheckout}
            disabled={isLoading}
            className="w-full bg-sky-700 text-white p-3 rounded-md font-semibold hover:bg-sky-600 transition disabled:opacity-50"
        >
            {isLoading ? "Processing..." : `Enroll for Rp ${amount.toLocaleString("id-ID")}`}
        </button>
    );
}
