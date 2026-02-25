"use client";
import { useState } from "react";
import Link from "next/link";
import { redirect } from 'next/navigation';
export default async function Page({ }) {

  redirect('/dashboard');
}