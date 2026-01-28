export default function DMCAPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">DMCA Policy</h1>
        <div className="space-y-4 text-zinc-300">
          <p>
            This website respects the intellectual property rights of others and expects its users to do the same.
          </p>
          <p>
            We do not host any copyrighted content. All manga content is sourced from third-party providers.
            If you believe that your copyrighted work has been copied in a way that constitutes copyright
            infringement, please contact the respective content provider directly.
          </p>
          <p>
            For any DMCA-related inquiries regarding this platform, please contact us with the following information:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>A description of the copyrighted work that you claim has been infringed</li>
            <li>A description of where the material is located on the site</li>
            <li>Your contact information (address, phone number, email)</li>
            <li>A statement that you have a good faith belief that the disputed use is not authorized</li>
            <li>A statement that the information in the notification is accurate</li>
            <li>Your physical or electronic signature</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
