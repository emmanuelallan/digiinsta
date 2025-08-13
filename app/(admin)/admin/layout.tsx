"use client"

import type React from "react"
import { Header } from "@/components/admin/header"
import { SideBar } from "@/components/admin/sidebar"
import { usePathname } from "next/navigation"

export default function AdminLayout({
	children,
}: {
	children: React.ReactNode
}) {
	const pathname = usePathname()
	const isAuthPage = pathname?.startsWith('/admin/auth')

	// If it's an auth page, render children without header and sidebar
	if (isAuthPage) {
		return <>{children}</>
	}

	return (
		<div className="min-h-screen bg-background overflow-hidden">
			<Header />
			<main className="h-main flex flex-col relative overflow-y-auto">
				<div className="flex-1 overflow-hidden">
					<div className="min-h-main h-full overflow-y-auto">
						<div className="min-h-10"></div>
						<div className="content-container flex">
							<div className="flex-1">
								{children}
							</div>
							<SideBar />
						</div>
						<div className="min-h-10"></div>
					</div>
				</div>
			</main>
		</div>
	)
}
