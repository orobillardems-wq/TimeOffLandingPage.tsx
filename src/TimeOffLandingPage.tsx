import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useEffect } from "react";

function useEmbedAutoResize(defaultId?: string) {
  useEffect(() => {
    // Determine which iframe we're in (from ?frameId=... or fallback)
    const params = new URLSearchParams(window.location.search);
    const id = params.get("frameId") || defaultId || "timeoff";

    const send = () => {
      const height = document.documentElement.scrollHeight || document.body.scrollHeight || 1000;
      window.parent?.postMessage({ type: "ems-resize", id, height }, "*");
    };

    // Initial + on changes
    send();
    const ro = new ResizeObserver(send);
    ro.observe(document.body);
    window.addEventListener("load", send);
    window.addEventListener("resize", send);

    return () => {
      ro.disconnect();
      window.removeEventListener("load", send);
      window.removeEventListener("resize", send);
    };
  }, [defaultId]);
}


type Dept =
  | "Administrative Assistant"
  | "Auditor"
  | "Crew Chief"
  | "Crew Tech"
  | "Inventory Coordinator"
  | "Marketing Coordinator"
  | "Office Staff"
  | "Operations Manager"
  | "Service Manager"
  | "";

type LeaveType = "Vacation" | "Sick" | "Personal" | "Unpaid" | "Paid" | "";

type FormData = {
  employeeName: string;
  department: Dept | "";
  phone: string;
  startDate: string;
  endDate: string;
  leaveType: LeaveType;
  reasonDetails: string;
  supervisorName?: string;
  attachment?: FileList;
};

export default function TimeOffLandingPage() {
  const defaultDate = useMemo(() => new Date().toISOString().split("T")[0], []);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      employeeName: "",
      department: "",
      phone: "",
      startDate: defaultDate,
      endDate: defaultDate,
      leaveType: "",
      reasonDetails: "",
      supervisorName: "",
    },
    mode: "onBlur",
  });

  // autosave to localStorage
  const all = watch();
  useEffect(() => {
    try {
      const { attachment, ...rest } = all as any;
      localStorage.setItem("ems-timeoff-draft", JSON.stringify(rest));
    } catch {}
  }, [all]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("ems-timeoff-draft");
      if (raw) reset(JSON.parse(raw));
    } catch {}
  }, [reset]);

  // For preview you can leave this as a placeholder.
  const WEB_APP_URL =
    "https://script.google.com/macros/s/AKfycbyIldLupEOVjMhtKNQe4T4tXYXB9HklVnVw-Rnil3U8LEbJe5gZfg8TWRO8yNXlK60T/exec";

  async function onSubmit(data: FormData) {
    const fd = new FormData();
    fd.append("employeeName", data.employeeName || "");
    fd.append("department", data.department || "");
    fd.append("phone", data.phone || "");
    fd.append("startDate", data.startDate || "");
    fd.append("endDate", data.endDate || "");
    fd.append("leaveType", data.leaveType || "");
    fd.append("reasonDetails", data.reasonDetails || "");
    fd.append("supervisorName", data.supervisorName || "");
    if (data.attachment?.length) {
      fd.append("attachment", data.attachment[0], data.attachment[0].name);
    }

    try {
      await fetch(WEB_APP_URL, { method: "POST", mode: "no-cors", body: fd });
      alert("Time-off request submitted!");
      localStorage.removeItem("ems-timeoff-draft");
    } catch (e) {
      alert("Demo mode: submitted locally (no backend connected).");
    }
  }

  // inline styles (same pattern as your callout page)
  const row2 = {
    display: "grid",
    gap: 8,
    gridTemplateColumns: "1fr 1fr",
  } as const;
  const full = { display: "grid", gap: 8 } as const;
  const label = { fontSize: 12, color: "#334155" } as const;
  const input = {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #e5e7eb",
  } as const;
  const section = {
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    padding: 16,
  } as const;

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      {/* Header */}
      <header
        style={{
          position: "sticky",
          top: 0,
          background: "white",
          borderBottom: "1px solid #e5e7eb",
          padding: "10px 16px",
          zIndex: 10,
        }}
      >
        <div
          style={{
            maxWidth: 960,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* You can upload RealLogo.png to /public and use /RealLogo.png here */}
            <img
              src="RealLogo.png"
              alt="EMS Logo"
              style={{ height: 60, objectFit: "contain" }}
            />
            <div>
              <div style={{ fontWeight: 600 }}>Time-Off Requests</div>
            </div>
          </div>
          <a href="#policy" style={{ fontSize: 14, color: "#334155" }}>
            Policy
          </a>
        </div>
      </header>

      {/* Main */}
      <main
        style={{
          maxWidth: 960,
          margin: "0 auto",
          padding: "24px 16px",
          display: "grid",
          gap: 16,
          gridTemplateColumns: "2fr 1fr",
        }}
      >
        {/* Form */}
        <section style={section}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>
            Submit a Time-Off Request
          </h2>
          <p style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>
            Complete the form below. HR will receive it immediately.
          </p>

          <form
            onSubmit={handleSubmit(onSubmit)}
            style={{ display: "grid", gap: 12 }}
          >
            <div style={row2}>
              <div>
                <label style={label}>Employee name</label>
                <input
                  style={input}
                  placeholder="Jane Doe"
                  {...register("employeeName", { required: true })}
                />
                {errors.employeeName && (
                  <small style={{ color: "#dc2626" }}>
                    Employee name is required
                  </small>
                )}
              </div>
              <div>
                <label style={label}>Best contact number</label>
                <input
                  style={input}
                  placeholder="(555) 555-5555"
                  {...register("phone", { required: true })}
                />
                {errors.phone && (
                  <small style={{ color: "#dc2626" }}>Enter valid phone</small>
                )}
              </div>
            </div>

            <div style={row2}>
              <div>
                <label style={label}>Department</label>
                <select
                  style={input}
                  {...register("department", { required: true })}
                >
                  <option value="">Choose department</option>
                  <option value="Administrative Assistant">
                    Administrative Assistant
                  </option>
                  <option value="Auditor">Auditor</option>
                  <option value="Crew Chief">Crew Chief</option>
                  <option value="Crew Tech">Crew Tech</option>
                  <option value="Inventory Coordinator">
                    Inventory Coordinator
                  </option>
                  <option value="Marketing Coordinator">
                    Marketing Coordinator
                  </option>
                  <option value="Office Staff">Office Staff</option>
                  <option value="Operations Manager">Operations Manager</option>
                  <option value="Service Manager">Service Manager</option>
                </select>
                {errors.department && (
                  <small style={{ color: "#dc2626" }}>Select department</small>
                )}
              </div>
              <div>
                <label style={label}>Leave type</label>
                <select
                  style={input}
                  {...register("leaveType", { required: true })}
                >
                  <option value="">Choose leave type</option>
                  <option value="Vacation">Vacation</option>
                  <option value="Sick">Sick</option>
                  <option value="Personal">Personal</option>
                  <option value="Unpaid">Unpaid</option>
                  <option value="Paid">Paid</option>
                </select>
                {errors.leaveType && (
                  <small style={{ color: "#dc2626" }}>Select leave type</small>
                )}
              </div>
            </div>

            <div style={row2}>
              <div>
                <label style={label}>Start date</label>
                <input
                  type="date"
                  style={input}
                  {...register("startDate", { required: true })}
                />
              </div>
              <div>
                <label style={label}>End date</label>
                <input
                  type="date"
                  style={input}
                  {...register("endDate", { required: true })}
                />
              </div>
            </div>

            <div style={full}>
              <label style={label}>Reason / notes</label>
              <textarea
                style={{ ...input, height: 100 }}
                placeholder="Short explanation…"
                {...register("reasonDetails", { required: true })}
              />
            </div>

            <div style={row2}>
              <div>
                <label style={label}>Supervisor name</label>
                <input
                  style={input}
                  placeholder="e.g., Alex Rivera"
                  {...register("supervisorName")}
                />
              </div>
              <div>
                <label style={label}>Attachment (optional)</label>
                <input type="file" style={input} {...register("attachment")} />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: "10px 16px",
                borderRadius: 12,
                border: "1px solid #0f172a",
                background: "#0f172a",
                color: "white",
                fontWeight: 600,
              }}
            >
              {isSubmitting ? "Submitting…" : "Submit request"}
            </button>
          </form>
        </section>

        {/* Sidebar */}
        <aside style={section}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
            How this works
          </h3>
          <ol style={{ marginLeft: 18, fontSize: 14 }}>
            <li>Submission is logged instantly.</li>
            <li>Supervisors and HR get notified.</li>
          </ol>
          <div id="policy" style={{ marginTop: 12, fontSize: 14 }}>
            <strong>Time-off policy (summary)</strong>
            <ul style={{ marginLeft: 18 }}>
              <li>Submit requests as early as possible.</li>
              <li>Supervisor approval required.</li>
              <li>Some requests may need documentation.</li>
            </ul>
          </div>
        </aside>
      </main>

      <footer
        style={{
          maxWidth: 960,
          margin: "0 auto",
          padding: 16,
          fontSize: 12,
          color: "#64748b",
        }}
      >
        © {new Date().getFullYear()} Energy Management Solutions
      </footer>
    </div>
  );
}




