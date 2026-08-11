import { Star } from "lucide-react";

const testimonials = [
  {
    name: "John Williams",
    company: "Residential Client",
    review:
      "Williams Enterprises exceeded our expectations and delivered a beautiful home on schedule.",
  },
  {
    name: "Sarah Moyo",
    company: "Business Owner",
    review:
      "Professional, reliable and highly skilled. We highly recommend their services.",
  },
  {
    name: "Michael Dube",
    company: "Property Developer",
    review:
      "Outstanding workmanship and excellent communication throughout the project.",
  },
];

export default function TestimonialSection() {
  return (
    <section className="bg-slate-100 py-24">

      <div className="mx-auto max-w-7xl px-6">

        <div className="text-center">
          <span className="font-semibold text-amber-600">
            TESTIMONIALS
          </span>

          <h2 className="mt-4 text-5xl font-bold text-[#0A2540]">
            What Our Clients Say
          </h2>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">

          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="rounded-3xl bg-white p-8 shadow-xl"
            >
              <div className="mb-6 flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    className="fill-amber-500 text-amber-500"
                  />
                ))}
              </div>

              <p className="text-gray-600">
                "{testimonial.review}"
              </p>

              <h3 className="mt-6 text-lg font-bold text-[#0A2540]">
                {testimonial.name}
              </h3>

              <p className="text-sm text-gray-500">
                {testimonial.company}
              </p>
            </div>
          ))}

        </div>

      </div>

    </section>
  );
}