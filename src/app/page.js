"use client";
import { useState } from "react";

export default function Home() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const graphqlQuery = {
        query: `
          query {
            transactions(offset: { hash: "${query.trim()}" }) {
              hash
              protocolVersion
              merkleTreeRoot
              block {
                height
                hash
              }
              identifiers
              raw
              contractActions {
                __typename
                ... on ContractDeploy {
                  address
                  state
                  chainState
                }
                ... on ContractCall {
                  address
                  state
                  entryPoint
                  chainState
                }
                ... on ContractUpdate {
                  address
                  state
                  chainState
                }
              }
            }
          }
        `,
      };

      const response = await fetch(
        "https://indexer.testnet-02.midnight.network/api/v1/graphql",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(graphqlQuery),
        }
      );

      const json = await response.json();
      if (json.errors)
        throw new Error(json.errors[0]?.message || "GraphQL error");

      setResult(json.data.transactions?.[0] || null);
    } catch (err) {
      setError(err.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start w-full max-w-2xl">
        <h1 className="text-[32px] sm:text-[48px] font-bold text-center sm:text-left">
          Midnight Explorer
        </h1>
        <p className="text-[16px] sm:text-[20px] text-center sm:text-left">
          A simple, fast, and beautiful way to explore the Midnight blockchain.
        </p>

        {/* 🧾 Form Section */}
        <form
          onSubmit={handleSubmit}
          className="flex w-full gap-4 flex-col sm:flex-row"
        >
          <input
            type="text"
            placeholder="Enter transaction hash"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Loading..." : "Submit"}
          </button>
        </form>

        {/* 🔍 Result */}
        {error && <p className="text-red-500">{error}</p>}

        {result && (
          <div className="mt-8 w-full bg-gray-800 p-4 rounded-md shadow-sm text-sm">
            <pre className="whitespace-pre-wrap break-all">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </main>

      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center"></footer>
    </div>
  );
}
