import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export default function ThemeTestPage() {
  return (
    // bg-background and text-foreground will test your base off-white and dark olive text
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            LinkVault Theme Test
          </h1>
          <p className="text-muted-foreground">
            Testing Tailwind, Shadcn, and custom globals.css
          </p>
        </div>

        {/* This Card tests your Card, Border, and Ring colors */}
        <Card className="w-full">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">NextAuth Setup Guide</CardTitle>
                <CardDescription>
                  Saved to your nextjs-fullstack vault
                </CardDescription>
              </div>
              <div className="flex gap-2">
                {/* Tests your Primary and Secondary variants */}
                <Badge variant="default">Auth</Badge>
                <Badge variant="secondary">Tutorial</Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="alias">Link Alias</Label>
              {/* Tests your Input background, Border, and focus:ring colors */}
              <Input
                id="alias"
                defaultValue="NextAuth V5 App Router Complete Setup"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="url">Raw URL</Label>
              <Input
                id="url"
                defaultValue="https://authjs.dev/reference/nextjs"
                readOnly
                className="font-mono text-muted-foreground bg-muted/50"
              />
            </div>
          </CardContent>

          <CardFooter className="flex justify-between border-t pt-6 mt-2">
            {/* Tests your Destructive variant */}
            <Button variant="destructive">Delete Link</Button>

            <div className="space-x-4">
              {/* Tests your Outline and Primary variants */}
              <Button variant="outline">Cancel</Button>
              <Button variant="default">Save Changes</Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
