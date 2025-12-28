"use client";

import React, { useState } from "react";
import { FaMap, FaUser, FaEnvelope, FaLock, FaImage, FaFileAlt } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "./AuthContext";

export function AuthScreen({ onSuccess }: { onSuccess?: () => void } = {}) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { register, login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (isRegister) {
        await register(name, email, password, avatarUrl, description);
      } else {
        await login(email, password);
      }
      // Call onSuccess callback if provided (for modal closing)
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-[#0f1110] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center size-16 rounded-full bg-emerald-500 mb-4">
            <FaMap className="text-white" size={32} />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">ViComp</h1>
          <p className="text-gray-400">Your personal tour guide companion</p>
        </div>

        {/* Auth Form */}
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-8">
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => setIsRegister(false)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                !isRegister
                  ? "bg-emerald-500 text-white"
                  : "bg-transparent text-gray-400 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsRegister(true)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                isRegister
                  ? "bg-emerald-500 text-white"
                  : "bg-transparent text-gray-400 hover:text-white"
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <FaUser className="inline mr-2" />
                  Name
                </label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required={isRegister}
                  className="w-full text-white"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <FaEnvelope className="inline mr-2" />
                Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="johndoe@email.com"
                required
                className="w-full text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <FaLock className="inline mr-2" />
                Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full text-white"
              />
            </div>

            {isRegister && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <FaImage className="inline mr-2" />
                    Avatar URL (optional)
                  </label>
                  <Input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="http://www.image.com/abc"
                    className="w-full text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <FaFileAlt className="inline mr-2" />
                    Description (optional)
                  </label>
                  <Input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Welcome to my profile!"
                    className="w-full text-white"
                  />
                </div>
              </>
            )}

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Loading..." : isRegister ? "Create Account" : "Sign In"}
            </Button>
          </form>

          {!isRegister && (
            <div className="mt-4 text-center">
              <button
                type="button"
                className="text-sm text-emerald-500 hover:text-emerald-400 transition"
              >
                Forgot password?
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            {isRegister ? "Already have an account? " : "Don't have an account? "}
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="text-emerald-500 hover:text-emerald-400 transition font-medium"
            >
              {isRegister ? "Sign in" : "Register now"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
