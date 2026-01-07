"use client";

import { useEffect, useRef } from "react";

export default function ParticlesBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrameId: number;
        let particles: Particle[] = [];
        let mouseX = 0;
        let mouseY = 0;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        };

        class Particle {
            x: number;
            y: number;
            size: number;
            speedX: number;
            speedY: number;
            originalX: number;
            originalY: number;

            constructor() {
                this.x = Math.random() * canvas!.width;
                this.y = Math.random() * canvas!.height;
                this.originalX = this.x;
                this.originalY = this.y;
                this.size = Math.random() * 1.5;
                this.speedX = (Math.random() - 0.5) * 0.5;
                this.speedY = (Math.random() - 0.5) * 0.5;
            }

            update() {
                // Base movement
                this.x += this.speedX;
                this.y += this.speedY;

                // Mouse interaction
                const dx = mouseX - this.x;
                const dy = mouseY - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const maxDistance = 150;

                if (distance < maxDistance) {
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    const force = (maxDistance - distance) / maxDistance;
                    const directionX = forceDirectionX * force * 2;
                    const directionY = forceDirectionY * force * 2;

                    this.x -= directionX;
                    this.y -= directionY;
                } else {
                    // Return to original drift if needed, or just let them float free
                    // For "dust", we usually just let them float but maybe wrap around
                    if (this.x > canvas!.width) this.x = 0;
                    if (this.x < 0) this.x = canvas!.width;
                    if (this.y > canvas!.height) this.y = 0;
                    if (this.y < 0) this.y = canvas!.height;
                }
            }

            draw() {
                const opacity = 1 - (Math.sqrt((mouseX - this.x) ** 2 + (mouseY - this.y) ** 2) / 200); // Fades out slightly near mouse? Or brightens?
                // Request said: "appear on mouse hover only on the BG" -> Maybe they are invisible UNLESS hovered?
                // Request: "dust tiny particles which appear on mouse hover only on the BG"
                // Interpreting as: Particles appear around the mouse or are only visible when mouse is near.

                // Let's make them visible only when near mouse
                const dx = mouseX - this.x;
                const dy = mouseY - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const visibleRadius = 300;

                if (dist < visibleRadius) {
                    const alpha = (1 - dist / visibleRadius) * 0.5;
                    ctx!.fillStyle = `rgba(150, 150, 180, ${alpha})`;
                    ctx!.beginPath();
                    ctx!.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                    ctx!.fill();
                }
            }
        }

        const initParticles = () => {
            particles = [];
            const particleCount = Math.floor((canvas.width * canvas.height) / 10000); // Density
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach((particle) => {
                particle.update();
                particle.draw();
            });
            animationFrameId = requestAnimationFrame(animate);
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        };

        window.addEventListener("resize", resize);
        window.addEventListener("mousemove", handleMouseMove);

        resize();
        animate();

        return () => {
            window.removeEventListener("resize", resize);
            window.removeEventListener("mousemove", handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none z-0"
        />
    );
}
