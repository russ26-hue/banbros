"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const emptyAward = { year: "", title: "", issuer: "" };

export default function AboutAdminPage() {
  const router = useRouter();

  const [companyTitle, setCompanyTitle] = useState("");
  const [companyBody, setCompanyBody] = useState("");
  const [strategyTitle, setStrategyTitle] = useState("");
  const [strategyBody, setStrategyBody] = useState("");
  const [mission, setMission] = useState("");
  const [vision, setVision] = useState("");
  const [awards, setAwards] = useState([]);

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("idle"); // idle | saving | error | success
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/cms/about`,
          {
            cache: "no-store",
          },
        );
        const data = await res.json();
        const sections = data.sections || {};

        setCompanyTitle(sections.company?.title || "");
        setCompanyBody(sections.company?.body || "");
        setStrategyTitle(sections.strategy?.title || "");
        setStrategyBody(sections.strategy?.body || "");
        setMission(sections.mission_vision?.mission || "");
        setVision(sections.mission_vision?.vision || "");
        setAwards(
          Array.isArray(sections.awards?.items) ? sections.awards.items : [],
        );
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function updateAward(index, field, value) {
    setAwards((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    );
  }

  function addAward() {
    setAwards((prev) => [...prev, { ...emptyAward }]);
  }

  function removeAward(index) {
    setAwards((prev) => prev.filter((_, i) => i !== index));
  }

  function moveAward(index, direction) {
    setAwards((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  async function saveSection(sectionKey, content) {
    const res = await fetch(`/api/admin/cms/about/${sectionKey}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(content),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || `Failed to save ${sectionKey}`);
    }
  }

  async function handleSave() {
    setStatus("saving");
    setErrorMessage("");

    try {
      // Each section is stored as its own CMS row, so this is four separate
      // saves. They run in sequence rather than in parallel so that if one
      // fails, the error clearly points at which section had the problem.
      await saveSection("company", { title: companyTitle, body: companyBody });
      await saveSection("strategy", {
        title: strategyTitle,
        body: strategyBody,
      });
      await saveSection("mission_vision", { mission, vision });
      await saveSection("awards", { items: awards });

      setStatus("success");
      router.refresh();
    } catch (err) {
      setErrorMessage(err.message || "Failed to save.");
      setStatus("error");
    }
  }

  if (loading) return <p className="text-text-muted">Loading...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-6">About Page Content</h1>

      <div className="space-y-8 max-w-2xl">
        {/* Company */}
        <div className="bg-white border border-border rounded-lg p-5">
          <h2 className="font-semibold text-navy mb-3">About the Company</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-navy mb-1">
                Heading
              </label>
              <input
                type="text"
                value={companyTitle}
                onChange={(e) => setCompanyTitle(e.target.value)}
                placeholder="About Banbros Commercial Inc."
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy mb-1">
                Body
              </label>
              <textarea
                rows={5}
                value={companyBody}
                onChange={(e) => setCompanyBody(e.target.value)}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Strategy */}
        <div className="bg-white border border-border rounded-lg p-5">
          <h2 className="font-semibold text-navy mb-3">Strategy</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-navy mb-1">
                Heading
              </label>
              <input
                type="text"
                value={strategyTitle}
                onChange={(e) => setStrategyTitle(e.target.value)}
                placeholder="Our Strategy"
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy mb-1">
                Body
              </label>
              <textarea
                rows={5}
                value={strategyBody}
                onChange={(e) => setStrategyBody(e.target.value)}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="bg-white border border-border rounded-lg p-5">
          <h2 className="font-semibold text-navy mb-3">Mission &amp; Vision</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-navy mb-1">
                Mission
              </label>
              <textarea
                rows={4}
                value={mission}
                onChange={(e) => setMission(e.target.value)}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy mb-1">
                Vision
              </label>
              <textarea
                rows={4}
                value={vision}
                onChange={(e) => setVision(e.target.value)}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Awards */}
        <div className="bg-white border border-border rounded-lg p-5">
          <h2 className="font-semibold text-navy mb-3">
            Awards &amp; Recognition
          </h2>

          {awards.length === 0 && (
            <p className="text-sm text-text-muted mb-3">No awards added yet.</p>
          )}

          <div className="space-y-3">
            {awards.map((award, i) => (
              <div key={i} className="border border-border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-navy">
                    Award {i + 1}
                  </p>
                  <div className="flex gap-2 text-sm">
                    <button
                      type="button"
                      onClick={() => moveAward(i, -1)}
                      disabled={i === 0}
                      className="text-text-muted hover:text-navy disabled:opacity-30"
                    >
                      ↑ Up
                    </button>
                    <button
                      type="button"
                      onClick={() => moveAward(i, 1)}
                      disabled={i === awards.length - 1}
                      className="text-text-muted hover:text-navy disabled:opacity-30"
                    >
                      ↓ Down
                    </button>
                    <button
                      type="button"
                      onClick={() => removeAward(i)}
                      className="text-red-600 font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Year (e.g. 2025)"
                    value={award.year}
                    onChange={(e) => updateAward(i, "year", e.target.value)}
                    className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <input
                    type="text"
                    placeholder="Award title"
                    value={award.title}
                    onChange={(e) => updateAward(i, "title", e.target.value)}
                    className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <input
                    type="text"
                    placeholder="Issued by"
                    value={award.issuer}
                    onChange={(e) => updateAward(i, "issuer", e.target.value)}
                    className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addAward}
            className="mt-3 text-sm text-primary font-semibold hover:underline"
          >
            + Add Award
          </button>
        </div>

        {status === "error" && (
          <p className="text-sm text-red-600">{errorMessage}</p>
        )}
        {status === "success" && (
          <p className="text-sm text-green-600">Saved successfully.</p>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={status === "saving"}
          className="bg-primary text-white text-sm font-semibold px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === "saving" ? "Saving..." : "Save About Page"}
        </button>
      </div>
    </div>
  );
}
