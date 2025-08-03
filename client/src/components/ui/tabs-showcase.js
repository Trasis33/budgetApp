import React from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './enhanced-tabs'

const TabsShowcase = () => {
  return (
    <div style={{
      padding: 'var(--spacing-6xl)',
      background: 'var(--bg-card)',
      backdropFilter: 'var(--backdrop-blur)',
      borderRadius: 'var(--border-radius-lg)',
      border: '1px solid var(--border-color)',
      margin: 'var(--spacing-4xl) 0'
    }}>
      <h3 style={{
        fontSize: 'var(--font-size-xl)',
        fontWeight: 600,
        background: 'var(--bg-gradient-primary)',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: 'var(--spacing-4xl)'
      }}>
        🎨 Design System Tabs Showcase
      </h3>
      
      <Tabs defaultValue="glassmorphism" style={{ width: '100%' }}>
        <TabsList>
          <TabsTrigger value="glassmorphism">
            <span style={{ marginRight: 'var(--spacing-lg)' }}>✨</span>
            Glassmorphism
          </TabsTrigger>
          <TabsTrigger value="gradients">
            <span style={{ marginRight: 'var(--spacing-lg)' }}>🎨</span>
            Gradients
          </TabsTrigger>
          <TabsTrigger value="animations">
            <span style={{ marginRight: 'var(--spacing-lg)' }}>🌊</span>
            Animations
          </TabsTrigger>
          <TabsTrigger value="responsive">
            <span style={{ marginRight: 'var(--spacing-lg)' }}>📱</span>
            Responsive
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="glassmorphism" style={{ 
          marginTop: 'var(--spacing-4xl)',
          padding: 'var(--spacing-4xl)',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: 'var(--border-radius-md)',
          border: '1px solid var(--border-color)'
        }}>
          <h4 style={{ 
            color: 'var(--color-text-primary)', 
            marginBottom: 'var(--spacing-3xl)',
            fontWeight: 600
          }}>
            Glassmorphism Effects
          </h4>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
            The tabs feature beautiful glassmorphism effects with backdrop blur, 
            translucent backgrounds, and subtle border styling that creates depth 
            and visual hierarchy matching the design system.
          </p>
        </TabsContent>
        
        <TabsContent value="gradients" style={{ 
          marginTop: 'var(--spacing-4xl)',
          padding: 'var(--spacing-4xl)',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: 'var(--border-radius-md)',
          border: '1px solid var(--border-color)'
        }}>
          <h4 style={{ 
            color: 'var(--color-text-primary)', 
            marginBottom: 'var(--spacing-3xl)',
            fontWeight: 600
          }}>
            Gradient Styling
          </h4>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
            Active tabs showcase stunning gradient backgrounds using the design system's 
            primary gradient (purple to cyan), creating a cohesive visual language 
            throughout the application.
          </p>
        </TabsContent>
        
        <TabsContent value="animations" style={{ 
          marginTop: 'var(--spacing-4xl)',
          padding: 'var(--spacing-4xl)',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: 'var(--border-radius-md)',
          border: '1px solid var(--border-color)'
        }}>
          <h4 style={{ 
            color: 'var(--color-text-primary)', 
            marginBottom: 'var(--spacing-3xl)',
            fontWeight: 600
          }}>
            Smooth Animations
          </h4>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
            All interactions feature smooth 0.3s transitions with hover lift effects,
            color changes, and shadow animations that provide immediate visual feedback
            and professional polish.
          </p>
        </TabsContent>
        
        <TabsContent value="responsive" style={{ 
          marginTop: 'var(--spacing-4xl)',
          padding: 'var(--spacing-4xl)',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: 'var(--border-radius-md)',
          border: '1px solid var(--border-color)'
        }}>
          <h4 style={{ 
            color: 'var(--color-text-primary)', 
            marginBottom: 'var(--spacing-3xl)',
            fontWeight: 600
          }}>
            Responsive Design
          </h4>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
            The tabs automatically adapt to different screen sizes with responsive
            padding, font sizing, and layout adjustments ensuring optimal usability
            across all devices.
          </p>
        </TabsContent>
      </Tabs>
      
      <div style={{
        marginTop: 'var(--spacing-6xl)',
        padding: 'var(--spacing-4xl)',
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(6, 182, 212, 0.05) 100%)',
        borderRadius: 'var(--border-radius-md)',
        border: '1px solid rgba(139, 92, 246, 0.2)'
      }}>
        <h4 style={{ 
          color: 'var(--color-primary)', 
          marginBottom: 'var(--spacing-2xl)',
          fontWeight: 600
        }}>
          ✅ Implementation Success
        </h4>
        <ul style={{ 
          color: 'var(--color-text-secondary)', 
          listStyle: 'none',
          padding: 0,
          margin: 0
        }}>
          <li style={{ marginBottom: 'var(--spacing-lg)' }}>
            🌟 Glassmorphism effects with backdrop blur integration
          </li>
          <li style={{ marginBottom: 'var(--spacing-lg)' }}>
            🎨 Design system color palette and CSS custom properties
          </li>
          <li style={{ marginBottom: 'var(--spacing-lg)' }}>
            ✨ Smooth hover and active state animations
          </li>
          <li style={{ marginBottom: 'var(--spacing-lg)' }}>
            🔄 A/B testing toggle for easy comparison
          </li>
          <li>
            📱 Responsive design with mobile optimization
          </li>
        </ul>
      </div>
    </div>
  )
}

export default TabsShowcase
