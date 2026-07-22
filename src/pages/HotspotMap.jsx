import { MapContainer, CircleMarker, Popup, TileLayer } from "react-leaflet";
import { MapPinned, ShieldAlert } from "lucide-react";
import PageHeader from "../components/common/PageHeader";
import { crimeCases } from "../data/crimeData";

function HotspotMap() {
  return (
    <div className="flex h-full min-h-0 flex-col bg-[#020817]">
      <PageHeader
        icon={MapPinned}
        title="Crime Hotspot Map"
        description="Geospatial distribution of FIR incidents across Karnataka"
      />

      <div className="grid min-h-0 flex-1 gap-5 overflow-y-auto p-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-h-[600px] overflow-hidden rounded-2xl border border-slate-700">
          <MapContainer
            center={[14.5, 76.2]}
            zoom={7}
            className="h-full min-h-[600px] w-full"
          >
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {crimeCases.map((crime) => (
              <CircleMarker
                key={crime.id}
                center={[crime.latitude, crime.longitude]}
                radius={crime.gravity === "High" ? 14 : 9}
                pathOptions={{
                  color: crime.gravity === "High" ? "#ef4444" : "#3b82f6",
                  fillOpacity: 0.65,
                }}
              >
                <Popup>
                  <div className="min-w-52">
                    <strong>{crime.crimeHead}</strong>
                    <p>{crime.crimeSubHead}</p>
                    <p>{crime.district}</p>
                    <p>{crime.policeStation} Police Station</p>
                    <p>{crime.date}</p>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-700 bg-[#071225] p-5">
            <h2 className="font-semibold text-white">
              Hotspot Summary
            </h2>

            <div className="mt-5 space-y-3">
              {[
                ["High-risk incidents", "2"],
                ["Mapped incidents", crimeCases.length],
                ["Districts covered", "4"],
                ["Most affected", "Bengaluru Urban"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex justify-between rounded-xl bg-[#0b1930] px-4 py-3"
                >
                  <span className="text-sm text-slate-400">{label}</span>
                  <span className="text-sm font-semibold text-white">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5">
            <div className="flex gap-3">
              <ShieldAlert className="text-red-400" size={20} />

              <div>
                <h3 className="font-semibold text-white">
                  Emerging hotspot
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Bengaluru Urban has the highest concentration of mapped
                  incidents in this demonstration dataset.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default HotspotMap;