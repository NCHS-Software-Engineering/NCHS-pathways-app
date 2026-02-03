import Link from 'next/link';
import React from 'react';

const PathwayCard = ({ title, category, image }) => (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition">
        <div
            className="h-32 bg-cover bg-center"
            style={{ backgroundImage: `url(${image})` }}
        />
        <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
            <span className="inline-block mt-2 px-2 py-1 text-xs bg-gray-100 rounded-md text-gray-600">
                {category}
            </span>
        </div>
    </div>
);

export default function EndorsementsPage() {
    return (
        <>
            <header>
                <h1>Pathways Portal</h1>
                <Link href="/signin">Sign In</Link>
            </header>
    );
}
          